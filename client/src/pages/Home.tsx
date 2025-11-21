import { useState, useEffect } from "react";
import { LiquidBar } from "@/components/LiquidBar";
import { DrinkInput } from "@/components/DrinkInput";
import { Card } from "@/components/ui/card";
import { Trophy, Timer, History, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

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

  // Fetch active challenges
  const { data: activeChallenges = [] } = useQuery<any[]>({
    queryKey: ["/api/challenges/active"],
    enabled: !!user,
  });

  const currentChallenge = activeChallenges[0]; // Use first active challenge

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

  if (!currentChallenge) {
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
            <p className="text-xs text-muted-foreground uppercase font-bold">Goal</p>
            <p className="text-lg font-display font-bold">{currentChallenge.targetMl}ml</p>
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

      {/* Action Area */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
        <DrinkInput onAdd={(amount) => logDrinkMutation.mutate(amount)} />
      </div>

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
            <span className="text-muted-foreground">Target</span>
            <span className="font-mono">{currentChallenge.targetMl}ml / {currentChallenge.type}</span>
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
