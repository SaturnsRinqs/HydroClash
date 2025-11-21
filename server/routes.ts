import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertChallengeSchema, 
  insertDrinkSchema, 
  updateUserSettingsSchema 
} from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User settings routes
  app.patch('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = updateUserSettingsSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: fromError(validation.error).toString() 
        });
      }

      const updatedUser = await storage.updateUserSettings(userId, validation.data);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Challenge routes
  app.post('/api/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertChallengeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: fromError(validation.error).toString() 
        });
      }

      const challenge = await storage.createChallenge({
        ...validation.data,
        creatorId: userId,
      });

      // Automatically add creator as participant
      await storage.addParticipant({
        challengeId: challenge.id,
        userId: userId,
      });

      res.json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  app.get('/api/challenges/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenges = await storage.getUserActiveChallenges(userId);
      
      // Check and update status for each challenge
      const updatedChallenges = await Promise.all(
        challenges.map(c => storage.checkAndUpdateChallengeStatus(c.id))
      );
      
      // Return all challenges (including just-completed ones) so UI can show completion state
      res.json(updatedChallenges.filter(c => c !== undefined));
    } catch (error) {
      console.error("Error fetching active challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get('/api/challenges/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenges = await storage.getChallengesByUser(userId);
      
      // Check and update status for each challenge
      const updatedChallenges = await Promise.all(
        challenges.map(c => storage.checkAndUpdateChallengeStatus(c.id))
      );
      
      res.json(updatedChallenges.filter(c => c !== undefined));
    } catch (error) {
      console.error("Error fetching challenge history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.get('/api/challenges/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check and update status before returning
      const challenge = await storage.checkAndUpdateChallengeStatus(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  app.get('/api/challenges/invite/:inviteCode', async (req: any, res) => {
    try {
      const challenge = await storage.getChallengeByInviteCode(req.params.inviteCode);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge by invite:", error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  app.post('/api/challenges/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challengeId = req.params.id;
      
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check if user is already a participant
      const participants = await storage.getChallengeParticipants(challengeId);
      if (participants.includes(userId)) {
        return res.status(400).json({ message: "You are already in this challenge" });
      }

      // Add user as participant
      await storage.addParticipant({
        challengeId: challengeId,
        userId: userId,
      });

      res.json({ success: true, challenge });
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ message: "Failed to join challenge" });
    }
  });

  app.get('/api/challenges/:id/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const challengeId = req.params.id;
      
      // Check and update challenge status before returning leaderboard
      await storage.checkAndUpdateChallengeStatus(challengeId);
      
      const leaderboard = await storage.getChallengeLeaderboard(challengeId);
      const participantIds = await storage.getChallengeParticipants(challengeId);
      
      // Get user details for each participant
      const participantsWithData = await Promise.all(
        participantIds.map(async (userId) => {
          const user = await storage.getUser(userId);
          const leaderboardEntry = leaderboard.find(l => l.userId === userId);
          return {
            id: userId,
            name: user?.displayName || user?.firstName || 'User',
            avatar: user?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            color: user?.liquidColor || '#06b6d4',
            currentMl: leaderboardEntry?.totalMl || 0,
          };
        })
      );

      res.json(participantsWithData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Drink logging routes
  app.post('/api/drinks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertDrinkSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: fromError(validation.error).toString() 
        });
      }

      if (!validation.data.challengeId) {
        return res.status(400).json({ 
          message: "Challenge ID is required" 
        });
      }

      // Verify user is a participant
      const participants = await storage.getChallengeParticipants(validation.data.challengeId);
      if (!participants.includes(userId)) {
        return res.status(403).json({ 
          message: "You are not a participant in this challenge" 
        });
      }

      // Check if challenge is still active before logging
      const challenge = await storage.checkAndUpdateChallengeStatus(validation.data.challengeId);
      if (!challenge || challenge.status !== 'active') {
        return res.status(400).json({ 
          message: "This challenge has ended. No more drinks can be logged." 
        });
      }

      // Log the drink
      const drink = await storage.logDrink({
        ...validation.data,
        userId: userId,
      });

      // Check if this drink completed the challenge
      const updatedChallenge = await storage.checkAndUpdateChallengeStatus(validation.data.challengeId);
      
      res.json({ 
        drink,
        challengeCompleted: updatedChallenge?.status === 'completed'
      });
    } catch (error) {
      console.error("Error logging drink:", error);
      res.status(500).json({ message: "Failed to log drink" });
    }
  });

  app.get('/api/drinks/challenge/:challengeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drinks = await storage.getUserDrinksForChallenge(userId, req.params.challengeId);
      res.json(drinks);
    } catch (error) {
      console.error("Error fetching drinks:", error);
      res.status(500).json({ message: "Failed to fetch drinks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
