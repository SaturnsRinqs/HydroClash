import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function NewChallenge() {
  const [_, setLocation] = useLocation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to backend
    setLocation("/");
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/">
          <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold font-display">Create Challenge</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Challenge Name</Label>
            <Input id="name" placeholder="e.g., Weekend Warriors" className="bg-black/20 border-white/10 h-12" required />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Goal Type</Label>
            <RadioGroup defaultValue="daily" className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="daily" id="daily" className="peer sr-only" />
                <Label
                  htmlFor="daily"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-bold text-lg">Daily Goal</span>
                  <span className="text-xs text-muted-foreground mt-1">Reset every 24h</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="total" id="total" className="peer sr-only" />
                <Label
                  htmlFor="total"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 [&:has([data-state=checked])]:border-primary"
                >
                  <span className="font-bold text-lg">Total Goal</span>
                  <span className="text-xs text-muted-foreground mt-1">Race to the finish</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-white">Target Amount (ml)</Label>
            <Input id="target" type="number" defaultValue={3000} className="bg-black/20 border-white/10 h-12" />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Invite Friends</Label>
            <div className="p-4 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center bg-black/10 gap-2 hover:bg-black/20 transition-colors cursor-pointer">
              <div className="p-3 rounded-full bg-primary/20 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Tap to generate invite link</p>
              <p className="text-xs text-muted-foreground">or select from recent friends</p>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full text-lg font-bold h-14 bg-primary text-black hover:bg-primary/90">
          Start Challenge <Plus className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
