import { useState, useEffect } from "react";
import { LiquidBar } from "@/components/LiquidBar";
import { DrinkInput } from "@/components/DrinkInput";
import { Card } from "@/components/ui/card";
import { Trophy, Timer, History, User as UserIcon, Share2, Copy, Check, Wine } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

function TimeRemaining({ startDate, durationMinutes }: { startDate: string | null; durationMinutes: number | null }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!startDate || !durationMinutes) {
      setTimeLeft("No limit");
      return;
    }

    const calculateTimeLeft = () => {
      const start = new Date(startDate).getTime();
      const end = start + (durationMinutes * 60 * 1000);
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [startDate, durationHours]);

  return <span>{timeLeft}</span>;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  currentMl: number;
  color: string;
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Fetch active challenges (includes recently completed ones)
  const { data: activeChallenges = [] } = useQuery<any[]>({
    queryKey: ["/api/challenges/active"],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5s to catch time-based completions
  });

  // Prioritize active challenges, but show completed ones if no active ones exist
  const currentChallenge = activeChallenges.find(c => c.status === 'active') || activeChallenges[0];

  // Fetch leaderboard for current challenge
  const { data: leaderboard = [] } = useQuery<LeaderboardUser[]>({
    queryKey: [`/api/challenges/${currentChallenge?.id}/leaderboard`],
    enabled: !!currentChallenge,
  });

  // Log drink mutation
  const logDrinkMutation = useMutation({
    mutationFn: async (amountMl: number) => {
      const response = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amountMl,
          challengeId: currentChallenge?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`${response.status}: ${error.message}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${currentChallenge?.id}/leaderboard`] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/active"] });
      toast({
        title: "Drink logged!",
        description: "Keep going, hydration champion! 💧",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Check if it's a challenge ended error
      if (error.message.includes("challenge has ended")) {
        toast({
          title: "Challenge Complete! 🏆",
          description: "This challenge has ended. Create a new one to continue!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/challenges/active"] });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to log drink. Try again.",
        variant: "destructive",
      });
    },
  });

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.currentMl - a.currentMl);
  const leader = sortedLeaderboard[0];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentChallenge || (currentChallenge.status === 'completed' && activeChallenges.length === 1 && activeChallenges[0].status === 'completed')) {
    // Only show "no challenges" if truly no challenges exist, not if we have a just-completed one
    const hasNoActiveChallenges = !currentChallenge || activeChallenges.every(c => c.status === 'completed');
    
    if (hasNoActiveChallenges && !currentChallenge) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <Card className="glass-panel p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">No Active Challenges</h2>
            <p className="text-muted-foreground mb-6">
              Create your first challenge to start tracking your hydration!
            </p>
            <Link href="/challenge/new">
              <a className="inline-block">
                <button className="bg-primary text-black px-6 py-3 rounded-lg font-bold hover:bg-primary/90" data-testid="button-create-challenge">
                  Create Challenge
                </button>
              </a>
            </Link>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Hydro<span className="text-primary">Clash</span>
          </h1>
          <p className="text-muted-foreground text-sm">Current: {currentChallenge.title}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/history">
            <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white" title="History" data-testid="link-history">
              <History className="w-6 h-6" />
            </a>
          </Link>
          <Link href="/profile">
            <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white" title="Profile" data-testid="link-profile">
              <UserIcon className="w-6 h-6" />
            </a>
          </Link>
        </div>
      </header>

      {/* Challenge Title - Animated */}
      <div className="mb-8 text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundSize: '200% auto',
            animation: 'gradient 3s linear infinite',
          }}
        >
          {currentChallenge.title}
        </motion.h2>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-card/40 border-white/5 backdrop-blur-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Leader</p>
            <p className="text-lg font-display font-bold" data-testid="text-leader">
              {leader?.name || "N/A"}
            </p>
          </div>
        </Card>
        <Card className="bg-card/40 border-white/5 backdrop-blur-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20 text-primary">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">
              {currentChallenge.durationMinutes ? "Time Left" : "Goal"}
            </p>
            <p className="text-lg font-display font-bold">
              {currentChallenge.durationMinutes ? (
                <TimeRemaining startDate={currentChallenge.startDate} durationMinutes={currentChallenge.durationMinutes} />
              ) : (
                `${currentChallenge.targetMl}ml`
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Visualization */}
      <div className="relative min-h-[400px] flex items-end justify-center gap-4 md:gap-8 mb-12 px-2">
        {sortedLeaderboard.map((participant, index) => (
          <LiquidBar 
            key={participant.id}
            current={participant.currentMl}
            max={currentChallenge.targetMl}
            color={participant.color}
            name={participant.name}
            avatar={participant.avatar}
            isUser={participant.id === user?.id}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Action Area - Only show if challenge is active */}
      {currentChallenge?.status === 'active' && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
          <DrinkInput onAdd={(amount) => logDrinkMutation.mutate(amount)} />
        </div>
      )}

      {/* Show animated winner announcement if challenge ended */}
      {currentChallenge?.status === 'completed' && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <Card className="glass-panel p-6 text-center max-w-md">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="mb-2"
              >
                <div className="flex justify-center gap-2 mb-2">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <Wine className="w-8 h-8 text-primary" />
                  </motion.div>
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <Wine className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">🎉 Challenge Complete!</h3>
              <p className="text-lg font-bold text-primary mb-1">
                {leader ? `🏆 ${leader.name} Wins! 🏆` : "Well done, everyone!"}
              </p>
              <p className="text-muted-foreground mb-4 text-sm">
                {leader ? `Final Score: ${leader.currentMl}ml` : ""}
                {currentChallenge.completionReason === 'time_limit' && !leader?.currentMl ? " (Time's up!)" : ""}
              </p>
              <Link href="/challenge/new">
                <a className="inline-block">
                  <button className="bg-primary text-black px-6 py-3 rounded-lg font-bold hover:bg-primary/90" data-testid="button-new-challenge">
                    Start New Challenge
                  </button>
                </a>
              </Link>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Challenge Info */}
      <Card className="glass-panel p-6 mb-24">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold font-display">Challenge Details</h3>
          <Link href="/challenge/new">
            <a className="text-xs text-primary hover:underline" data-testid="link-new-challenge">New Challenge</a>
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target Goal</span>
            <span className="font-mono">{currentChallenge.targetMl}ml</span>
          </div>
          {currentChallenge.durationMinutes && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono">
                {currentChallenge.durationMinutes >= 60 
                  ? `${Math.floor(currentChallenge.durationMinutes / 60)}h ${currentChallenge.durationMinutes % 60}m`
                  : `${currentChallenge.durationMinutes}m`
                }
              </span>
            </div>
          )}
          <div className="text-xs text-muted-foreground italic border-l-2 border-primary/50 pl-3 py-1">
            {currentChallenge.durationMinutes 
              ? "First to reach the goal OR whoever has the most when time runs out wins!"
              : "First to reach the goal wins!"}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                const inviteUrl = `${window.location.origin}/?invite=${currentChallenge.inviteCode}`;
                navigator.clipboard.writeText(inviteUrl);
                setCopiedInvite(true);
                toast({
                  title: "Invite link copied!",
                  description: "Share this link to invite friends to your challenge.",
                });
                setTimeout(() => setCopiedInvite(false), 2000);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
              data-testid="button-copy-invite"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Invite Link
                </>
              )}
            </button>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Participants</span>
            <div className="flex -space-x-2">
              {sortedLeaderboard.slice(0, 5).map((p) => (
                 <img 
                  key={p.id} 
                  src={p.avatar} 
                  alt={p.name}
                  className="w-6 h-6 rounded-full border border-background"
                />
              ))}
              {sortedLeaderboard.length > 5 && (
                <div className="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-xs">
                  +{sortedLeaderboard.length - 5}
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-2 overflow-hidden">
             <div 
               className="h-full bg-primary" 
               style={{ 
                 width: `${Math.min(100, ((sortedLeaderboard.find(u => u.id === user?.id)?.currentMl || 0) / currentChallenge.targetMl * 100))}%` 
               }} 
             />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            You are {sortedLeaderboard.find(u => u.id === user?.id)?.currentMl || 0}ml towards your goal.
          </p>
        </div>
      </Card>
    </div>
  );
}
