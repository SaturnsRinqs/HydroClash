import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { MOCK_USERS } from "@/lib/mockData";

export default function Profile() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState({
    name: "You",
    color: "#06b6d4", // Default cyan
    avatar: ""
  });

  // Load saved user data on mount
  useEffect(() => {
    const savedName = localStorage.getItem("hydro_username");
    const savedColor = localStorage.getItem("hydro_color");
    
    if (savedName || savedColor) {
      setUser(prev => ({
        ...prev,
        name: savedName || prev.name,
        color: savedColor || prev.color
      }));
    } else {
      // Fallback to mock data if no local storage
      const mockUser = MOCK_USERS.find(u => u.id === 'u1');
      if (mockUser) {
        // Convert CSS variable to hex if needed, but here we assume we want hex for the picker
        // Since mock data uses var(--chart-1), we'll default to a hex for the picker
        setUser(prev => ({ ...prev, name: mockUser.name }));
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("hydro_username", user.name);
    localStorage.setItem("hydro_color", user.color);
    // Force a reload or just navigate back. 
    // Since we're using simple localStorage without a context for this prototype, 
    // the Home page might not update immediately unless we force it or use an event.
    // For simplicity in this prototype, navigating back is usually enough if the Home page reads on mount.
    // However, Home page reads from MOCK_USERS initially. We need to update Home to read from localStorage.
    
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
        <h1 className="text-2xl font-bold font-display">Profile & Customization</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden bg-black/20 flex items-center justify-center">
               {/* Use the DiceBear avatar but maybe allow customizable seed later */}
               <img 
                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
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
                  value={user.name}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="pl-10 bg-black/20 border-white/10 h-12 text-lg" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-white">Fluid Color (Hex Code)</Label>
              <div className="flex gap-4">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white/20 shadow-inner"
                  style={{ backgroundColor: user.color }}
                />
                <Input 
                  id="color" 
                  type="text" // Use text for hex input, or "color" for picker
                  value={user.color}
                  onChange={(e) => setUser({...user, color: e.target.value})}
                  className="flex-1 bg-black/20 border-white/10 h-12 font-mono" 
                  placeholder="#000000"
                />
                <Input 
                  type="color" 
                  value={user.color}
                  onChange={(e) => setUser({...user, color: e.target.value})}
                  className="w-12 h-12 p-1 bg-transparent border-white/10 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Pick a color that stands out on the leaderboard.
              </p>
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full text-lg font-bold h-14 bg-primary text-black hover:bg-primary/90">
          Save Changes <Save className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
