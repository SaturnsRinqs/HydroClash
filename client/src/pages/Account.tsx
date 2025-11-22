import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, History, Settings, LogOut, Zap } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function Account() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Not logged in</p>
          <Button onClick={() => window.location.href = "/api/auth/login"} className="mt-4">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const displayName = user.displayName || user.firstName || "Hydration Champion";

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 pt-8"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-black/20 flex items-center justify-center">
            <img
              src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 font-display">Welcome, {displayName}!</h1>
        <p className="text-muted-foreground">You're ready to dominate the hydration challenges</p>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        <Link href="/">
          <a>
            <Card className="glass-panel p-6 cursor-pointer hover:border-primary/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Active Challenges</h3>
                  <p className="text-sm text-muted-foreground">Track your current competitions and log drinks</p>
                </div>
              </div>
            </Card>
          </a>
        </Link>

        <Link href="/history">
          <a>
            <Card className="glass-panel p-6 cursor-pointer hover:border-primary/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <History className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Challenge History</h3>
                  <p className="text-sm text-muted-foreground">View completed challenges and past results</p>
                </div>
              </div>
            </Card>
          </a>
        </Link>

        <Link href="/challenge/new">
          <a>
            <Card className="glass-panel p-6 cursor-pointer hover:border-primary/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Create Challenge</h3>
                  <p className="text-sm text-muted-foreground">Start a new competition with your friends</p>
                </div>
              </div>
            </Card>
          </a>
        </Link>

        <Link href="/profile">
          <a>
            <Card className="glass-panel p-6 cursor-pointer hover:border-primary/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">Customize your name and liquid color</p>
                </div>
              </div>
            </Card>
          </a>
        </Link>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Button
          variant="outline"
          size="lg"
          className="w-full text-lg font-bold h-14"
          onClick={() => window.location.href = "/api/logout"}
          data-testid="button-logout"
        >
          Log Out <LogOut className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
