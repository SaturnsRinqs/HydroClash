import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Droplets, Trophy, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          Hydro<span className="text-primary">Clash</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-display">
          Challenge your friends to see who can stay hydrated. <br />
          Track drinks. Dominate leaderboards. Win glory.
        </p>
        <Button 
          size="lg" 
          className="h-16 px-12 text-xl font-bold bg-primary text-black hover:bg-primary/90 shadow-[0_0_30px_-5px_rgba(var(--primary),0.6)]"
          onClick={() => window.location.href = '/api/login'}
          data-testid="button-login"
        >
          Start Competing <Droplets className="ml-2 w-6 h-6" />
        </Button>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass-panel p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">Track Drinks</h3>
            <p className="text-muted-foreground text-sm">
              Log every sip with beautiful liquid animations showing your progress in real-time.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-panel p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">Challenge Friends</h3>
            <p className="text-muted-foreground text-sm">
              Create daily or total goal challenges and invite your friends to compete.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-panel p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">Live Leaderboards</h3>
            <p className="text-muted-foreground text-sm">
              Watch the competition unfold with flowing liquid bars updating in real-time.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Visual Demo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative"
      >
        <Card className="glass-panel p-8 max-w-md">
          <div className="flex gap-4 justify-center items-end h-48">
            {[
              { height: '75%', color: 'hsl(190 100% 50%)', delay: 0 },
              { height: '90%', color: 'hsl(260 80% 60%)', delay: 0.1 },
              { height: '60%', color: 'hsl(320 80% 60%)', delay: 0.2 },
            ].map((bar, i) => (
              <motion.div
                key={i}
                className="relative w-12 h-full bg-card/50 rounded-full border border-white/10 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: bar.delay + 0.5 }}
              >
                <motion.div
                  className="absolute bottom-0 left-0 right-0 w-full"
                  initial={{ height: 0 }}
                  animate={{ height: bar.height }}
                  transition={{ type: "spring", stiffness: 50, damping: 15, delay: bar.delay + 0.5 }}
                  style={{ backgroundColor: bar.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Customize your liquid color and compete for the top spot
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
