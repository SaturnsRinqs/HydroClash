import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidBarProps {
  current: number;
  max: number;
  color: string;
  name: string;
  avatar?: string;
  isUser?: boolean;
  rank?: number;
}

export function LiquidBar({ current, max, color, name, avatar, isUser, rank }: LiquidBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className={cn(
      "flex flex-col items-center gap-3 group transition-all duration-300",
      isUser ? "scale-110 z-10" : "scale-100 opacity-90 hover:opacity-100"
    )}>
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div className={cn(
          "absolute -top-12 z-20 font-display text-xl font-bold px-3 py-1 rounded-full shadow-lg animate-bounce",
          rank === 1 ? "bg-yellow-400 text-yellow-950" : 
          rank === 2 ? "bg-slate-300 text-slate-900" : 
          "bg-amber-700 text-amber-100"
        )}>
          #{rank}
        </div>
      )}

      {/* Bar Container */}
      <div className="relative w-16 h-64 bg-card/50 rounded-full border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Background Track */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Liquid Fill */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 w-full"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          style={{ backgroundColor: color }}
        >
          {/* Bubbles / Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Wave Top */}
          <div className="absolute -top-3 left-[-50%] right-[-50%] h-6 w-[200%] bg-white/30 rounded-[40%] animate-wave" />
          <div className="absolute -top-3 left-[-50%] right-[-50%] h-6 w-[200%] bg-white/10 rounded-[35%] animate-wave opacity-50" style={{ animationDuration: '6s' }} />
        </motion.div>

        {/* Measurement Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-px bg-white mx-auto w-8" />
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center text-center gap-1">
        <div className={cn(
          "w-10 h-10 rounded-full border-2 overflow-hidden bg-background",
          isUser ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "border-border"
        )}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-xs font-bold">
              {name.substring(0, 2)}
            </div>
          )}
        </div>
        <span className={cn(
          "font-display font-bold text-sm tracking-wider",
          isUser ? "text-primary" : "text-muted-foreground"
        )}>
          {name}
        </span>
        <span className="font-mono text-xs text-muted-foreground font-medium">
          {current}ml
        </span>
      </div>
    </div>
  );
}
