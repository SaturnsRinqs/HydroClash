import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function History() {
  const { user } = useAuth();
  
  const { data: challenges = [] } = useQuery<any[]>({
    queryKey: ["/api/challenges/history"],
    enabled: !!user,
  });

  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/">
          <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white" data-testid="link-back">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold font-display">Challenge History</h1>
      </header>

      {completedChallenges.length === 0 ? (
        <Card className="glass-panel p-8 text-center">
          <p className="text-muted-foreground">No completed challenges yet. Start competing!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedChallenges.map((challenge) => (
            <Card key={challenge.id} className="glass-panel p-0 overflow-hidden hover:bg-white/5 transition-colors">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold font-display text-white">{challenge.title}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-bold uppercase",
                    "bg-green-500/20 text-green-400"
                  )}>
                    completed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(challenge.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.targetMl}ml goal</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
