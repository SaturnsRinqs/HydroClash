import { MOCK_HISTORY } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function History() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/">
          <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold font-display">Challenge History</h1>
      </header>

      <div className="space-y-4">
        {MOCK_HISTORY.map((challenge) => {
          const winner = challenge.participants.reduce((prev, current) => 
            (prev.currentMl > current.currentMl) ? prev : current
          );

          return (
            <Card key={challenge.id} className="glass-panel p-0 overflow-hidden hover:bg-white/5 transition-colors">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold font-display text-white">{challenge.title}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-bold uppercase",
                    challenge.status === 'completed' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {challenge.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(challenge.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants.length} Participants</span>
                  </div>
                </div>

                <div className="bg-black/20 -mx-4 -mb-4 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-yellow-500/50 overflow-hidden">
                      <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow-500 font-bold uppercase flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Winner
                      </p>
                      <p className="text-sm font-bold text-white">{winner.name} ({winner.currentMl}ml)</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
