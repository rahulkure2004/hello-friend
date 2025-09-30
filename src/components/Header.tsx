import { Camera, Heart, Home, MessageCircle, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  currentUser?: any;
  onLogout?: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Camera className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            SocialSafe
          </h1>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-10 rounded-lg border-muted bg-muted/50"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Heart className="h-5 w-5" />
          </Button>
          
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="text-xs"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}