import { useState, useEffect } from "react";
import { LiquidBar } from "@/components/LiquidBar";
import { DrinkInput } from "@/components/DrinkInput";
import { CURRENT_CHALLENGE, User } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Trophy, Timer, History, Users } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const [participants, setParticipants] = useState<User[]>(CURRENT_CHALLENGE.participants);
  
  // Sort participants by ml descending
  const sortedParticipants = [...participants].sort((a, b) => b.currentMl - a.currentMl);

  const handleAddDrink = (amount: number) => {
    setParticipants(prev => prev.map(u => {
      if (u.id === 'u1') { // Current user
        return { ...u, currentMl: u.currentMl + amount };
      }
      return u;
    }));
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Hydro<span className="text-primary">Clash</span>
          </h1>
          <p className="text-muted-foreground text-sm">Current Challenge: {CURRENT_CHALLENGE.title}</p>
        </div>
        <Link href="/history">
          <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
            <History className="w-6 h-6" />
          </a>
        </Link>
      </header>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-card/40 border-white/5 backdrop-blur-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Leader</p>
            <p className="text-lg font-display font-bold">{sortedParticipants[0].name}</p>
          </div>
        </Card>
        <Card className="bg-card/40 border-white/5 backdrop-blur-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20 text-primary">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Time Left</p>
            <p className="text-lg font-display font-bold">04:22:10</p>
          </div>
        </Card>
      </div>

      {/* Main Visualization */}
      <div className="relative min-h-[400px] flex items-end justify-center gap-4 md:gap-8 mb-12 px-2">
        {sortedParticipants.map((user, index) => (
          <LiquidBar 
            key={user.id}
            {...user}
            current={user.currentMl}
            max={CURRENT_CHALLENGE.targetMl}
            isUser={user.id === 'u1'}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Action Area */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
        <DrinkInput onAdd={handleAddDrink} />
      </div>

      {/* Challenge Info */}
      <Card className="glass-panel p-6 mb-24">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold font-display">Challenge Details</h3>
          <Link href="/challenge/new">
            <a className="text-xs text-primary hover:underline">New Challenge</a>
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-mono">{CURRENT_CHALLENGE.targetMl}ml / day</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Participants</span>
            <div className="flex -space-x-2">
              {participants.map((p) => (
                 <img 
                  key={p.id} 
                  src={p.avatar} 
                  alt={p.name}
                  className="w-6 h-6 rounded-full border border-background"
                />
              ))}
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-2 overflow-hidden">
             <div 
               className="h-full bg-primary" 
               style={{ width: `${(participants.find(u => u.id === 'u1')?.currentMl || 0) / CURRENT_CHALLENGE.targetMl * 100}%` }} 
             />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            You are {(participants.find(u => u.id === 'u1')?.currentMl || 0)}ml towards your goal.
          </p>
        </div>
      </Card>
    </div>
  );
}
