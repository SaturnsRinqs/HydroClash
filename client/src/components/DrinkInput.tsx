import { Plus, Droplets, Coffee, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DrinkInputProps {
  onAdd: (amount: number) => void;
}

export function DrinkInput({ onAdd }: DrinkInputProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: "Sip", amount: 100, icon: Droplets },
    { label: "Glass", amount: 250, icon: Coffee }, // Using Coffee as generic cup icon
    { label: "Bottle", amount: 500, icon: Wine },   // Using Wine as generic bottle icon
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (amount > 0) {
      onAdd(amount);
      setCustomAmount("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 left-0 right-0 glass-panel p-4 rounded-2xl mb-4 z-50"
          >
            <div className="grid grid-cols-3 gap-2 mb-4">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  className="flex flex-col items-center h-auto py-3 gap-1 bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50"
                  onClick={() => {
                    onAdd(preset.amount);
                    setIsOpen(false);
                  }}
                >
                  <preset.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{preset.amount}ml</span>
                </Button>
              ))}
            </div>
            
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Custom amount..." 
                className="bg-black/20 border-white/10"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <Button type="submit" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        size="lg" 
        className={cn(
          "w-full h-16 rounded-full text-lg font-bold tracking-wider shadow-[0_0_30px_-5px_rgba(var(--primary),0.4)] transition-all duration-300",
          isOpen ? "bg-secondary text-white rotate-0" : "bg-primary text-black hover:scale-105"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Close" : "Log Drink"}
        <Droplets className={cn("ml-2 w-5 h-5", isOpen ? "animate-none" : "animate-bounce")} />
      </Button>
    </div>
  );
}
