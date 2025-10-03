import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { ReelCard } from "@/components/ReelCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";

interface User {
  id: string;
  email?: string;
}

export default function Favorites() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-current" />
            Favorites
          </h1>
          <p className="text-muted-foreground mt-2">Posts and reels you've liked</p>
        </div>

        {!currentUser ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-semibold mb-2">Sign in to see your favorites</p>
            <p className="text-muted-foreground">Like posts and reels to save them here</p>
          </div>
        ) : (
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="posts">Liked Posts</TabsTrigger>
              <TabsTrigger value="reels">Liked Reels</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              <div className="text-center py-12 bg-card rounded-lg border">
                <Heart className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No liked posts yet</p>
              </div>
            </TabsContent>

            <TabsContent value="reels" className="space-y-6">
              <div className="text-center py-12 bg-card rounded-lg border">
                <Heart className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No liked reels yet</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
