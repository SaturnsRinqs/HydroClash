import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function NewChallenge() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    type: "daily",
    targetMl: 3000,
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`${response.status}: ${error.message}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/active"] });
      toast({
        title: "Challenge created!",
        description: "Let the hydration games begin! 🏆",
      });
      setLocation("/");
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
        description: "Failed to create challenge. Try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChallengeMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/">
          <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white" data-testid="link-back">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold font-display">Create Challenge</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Challenge Name</Label>
            <Input 
              id="name" 
              placeholder="e.g., Weekend Warriors" 
              className="bg-black/20 border-white/10 h-12" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Goal Type</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="daily" id="daily" className="peer sr-only" />
                <Label
                  htmlFor="daily"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  data-testid="radio-daily"
                >
                  <span className="font-bold text-lg">Daily Goal</span>
                  <span className="text-xs text-muted-foreground mt-1">Reset every 24h</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="total" id="total" className="peer sr-only" />
                <Label
                  htmlFor="total"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  data-testid="radio-total"
                >
                  <span className="font-bold text-lg">Total Goal</span>
                  <span className="text-xs text-muted-foreground mt-1">Race to the finish</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-white">Target Amount (ml)</Label>
            <Input 
              id="target" 
              type="number" 
              value={formData.targetMl}
              onChange={(e) => setFormData({...formData, targetMl: parseInt(e.target.value)})}
              className="bg-black/20 border-white/10 h-12" 
              data-testid="input-target"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full text-lg font-bold h-14 bg-primary text-black hover:bg-primary/90"
          disabled={createChallengeMutation.isPending}
          data-testid="button-create"
        >
          {createChallengeMutation.isPending ? "Creating..." : "Start Challenge"} <Plus className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
