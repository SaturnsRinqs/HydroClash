import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, User, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    displayName: "",
    liquidColor: "#06b6d4",
  });

  useEffect(() => {
    if (user) {
      setSettings({
        displayName: user.displayName || user.firstName || "",
        liquidColor: user.liquidColor || "#06b6d4",
      });
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Settings saved!",
        description: "Your profile has been updated.",
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
        description: "Failed to save settings. Try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/">
          <a className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white" data-testid="link-back">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold font-display">Profile & Customization</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden bg-black/20 flex items-center justify-center">
               <img 
                 src={user?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Account Details</h3>
              <p className="text-sm text-muted-foreground">Customize your appearance on the leaderboard.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="name" 
                  value={settings.displayName}
                  onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                  className="pl-10 bg-black/20 border-white/10 h-12 text-lg" 
                  required 
                  data-testid="input-displayname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-white">Fluid Color (Hex Code)</Label>
              <div className="flex gap-4">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white/20 shadow-inner"
                  style={{ backgroundColor: settings.liquidColor }}
                />
                <Input 
                  id="color" 
                  type="text"
                  value={settings.liquidColor}
                  onChange={(e) => setSettings({...settings, liquidColor: e.target.value})}
                  className="flex-1 bg-black/20 border-white/10 h-12 font-mono" 
                  placeholder="#000000"
                  data-testid="input-color-text"
                />
                <Input 
                  type="color" 
                  value={settings.liquidColor}
                  onChange={(e) => setSettings({...settings, liquidColor: e.target.value})}
                  className="w-12 h-12 p-1 bg-transparent border-white/10 cursor-pointer"
                  data-testid="input-color-picker"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Pick a color that stands out on the leaderboard.
              </p>
            </div>
          </div>
        </Card>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full text-lg font-bold h-14 bg-primary text-black hover:bg-primary/90"
          disabled={updateSettingsMutation.isPending}
          data-testid="button-save"
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"} <Save className="ml-2 w-5 h-5" />
        </Button>

        <Button 
          type="button"
          variant="outline"
          size="lg" 
          className="w-full text-lg font-bold h-14"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          Log Out <LogOut className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
