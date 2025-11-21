import {
  users,
  challenges,
  challengeParticipants,
  drinks,
  type User,
  type UpsertUser,
  type Challenge,
  type InsertChallenge,
  type Drink,
  type InsertDrink,
  type UpdateUserSettings,
  type ChallengeParticipant,
  type InsertChallengeParticipant,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSettings(id: string, settings: UpdateUserSettings): Promise<User | undefined>;

  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  getChallengeByInviteCode(inviteCode: string): Promise<Challenge | undefined>;
  getChallengesByUser(userId: string): Promise<Challenge[]>;
  getUserActiveChallenges(userId: string): Promise<Challenge[]>;
  updateChallengeStatus(id: string, status: string): Promise<void>;
  checkAndUpdateChallengeStatus(challengeId: string): Promise<Challenge | undefined>;

  // Challenge participant operations
  addParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  getChallengeParticipants(challengeId: string): Promise<string[]>;
  
  // Drink operations
  logDrink(drink: InsertDrink): Promise<Drink>;
  getUserDrinksForChallenge(userId: string, challengeId: string): Promise<Drink[]>;
  getChallengeLeaderboard(challengeId: string): Promise<Array<{ userId: string; totalMl: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSettings(id: string, settings: UpdateUserSettings): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Challenge operations
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengeByInviteCode(inviteCode: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.inviteCode, inviteCode));
    return challenge;
  }

  async getChallengesByUser(userId: string): Promise<Challenge[]> {
    const userChallenges = await db
      .select({ challenge: challenges })
      .from(challengeParticipants)
      .innerJoin(challenges, eq(challengeParticipants.challengeId, challenges.id))
      .where(eq(challengeParticipants.userId, userId))
      .orderBy(desc(challenges.createdAt));
    
    return userChallenges.map(uc => uc.challenge);
  }

  async getUserActiveChallenges(userId: string): Promise<Challenge[]> {
    const activeChallenges = await db
      .select({ challenge: challenges })
      .from(challengeParticipants)
      .innerJoin(challenges, eq(challengeParticipants.challengeId, challenges.id))
      .where(
        and(
          eq(challengeParticipants.userId, userId),
          eq(challenges.status, "active")
        )
      )
      .orderBy(desc(challenges.createdAt));
    
    return activeChallenges.map(ac => ac.challenge);
  }

  async updateChallengeStatus(id: string, status: string): Promise<void> {
    await db
      .update(challenges)
      .set({ status, endDate: new Date() })
      .where(eq(challenges.id, id));
  }

  async checkAndUpdateChallengeStatus(challengeId: string): Promise<Challenge | undefined> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge || challenge.status !== 'active') {
      return challenge;
    }

    let shouldComplete = false;
    let completionReason: string | undefined;

    // Check if time limit exceeded
    if (challenge.durationMinutes && challenge.startDate) {
      const endTime = new Date(challenge.startDate).getTime() + (challenge.durationMinutes * 60 * 1000);
      if (Date.now() >= endTime) {
        shouldComplete = true;
        completionReason = 'time_limit';
      }
    }

    // Check if anyone reached the target
    const leaderboard = await this.getChallengeLeaderboard(challengeId);
    if (leaderboard.length > 0 && leaderboard[0].totalMl >= challenge.targetMl) {
      shouldComplete = true;
      completionReason = 'ml_goal';
    }

    if (shouldComplete) {
      await this.updateChallengeStatus(challengeId, 'completed', completionReason);
      return { ...challenge, status: 'completed', completionReason, endDate: new Date() };
    }

    return challenge;
  }

  // Participant operations
  async addParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const [newParticipant] = await db
      .insert(challengeParticipants)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async getChallengeParticipants(challengeId: string): Promise<string[]> {
    const participants = await db
      .select({ userId: challengeParticipants.userId })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challengeId));
    
    return participants.map(p => p.userId);
  }

  // Drink operations
  async logDrink(drink: InsertDrink): Promise<Drink> {
    const [newDrink] = await db.insert(drinks).values(drink).returning();
    return newDrink;
  }

  async getUserDrinksForChallenge(userId: string, challengeId: string): Promise<Drink[]> {
    return await db
      .select()
      .from(drinks)
      .where(
        and(
          eq(drinks.userId, userId),
          eq(drinks.challengeId, challengeId)
        )
      )
      .orderBy(desc(drinks.loggedAt));
  }

  async getChallengeLeaderboard(challengeId: string): Promise<Array<{ userId: string; totalMl: number }>> {
    const leaderboard = await db
      .select({
        userId: drinks.userId,
        totalMl: sql<number>`sum(${drinks.amountMl})::int`,
      })
      .from(drinks)
      .where(eq(drinks.challengeId, challengeId))
      .groupBy(drinks.userId)
      .orderBy(desc(sql`sum(${drinks.amountMl})`));
    
    return leaderboard;
  }
}

export const storage = new DatabaseStorage();
