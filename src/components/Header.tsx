import { Camera, Heart, Home, MessageCircle, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";

interface HeaderProps {
  currentUser?: any;
  onLogout?: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Camera className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            SocialSafe
          </h1>
        </Link>

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
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            asChild
          >
            <Link to="/" className={isActive('/') ? 'text-primary' : ''}>
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            asChild
          >
            <Link to="/messages" className={isActive('/messages') ? 'text-primary' : ''}>
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            asChild
          >
            <Link to="/favorites" className={isActive('/favorites') ? 'text-primary' : ''}>
              <Heart className="h-5 w-5" />
            </Link>
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
              onClick={() => setShowAuthDialog(true)}
            >
              Login
            </Button>
          )}
        </nav>
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </header>
  );
}