import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { ReelCard } from "@/components/ReelCard";
import { AuthDialog } from "@/components/AuthDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockPosts, mockReels } from "@/data/mockData";

interface User {
  id: string;
  email?: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  const [reels, setReels] = useState(mockReels);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          setShowAuth(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentUser={user} 
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        {!user && (
          <div className="text-center mb-8 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Welcome to SocialSafe
            </h2>
            <p className="text-muted-foreground mb-4">
              A social platform powered by AI cyberbullying detection for safer communities
            </p>
            <button 
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 h-10 px-4 py-2"
            >
              Join the Community
            </button>
          </div>
        )}

        <Tabs defaultValue="posts" className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="posts" className="text-base">Posts</TabsTrigger>
            <TabsTrigger value="reels" className="text-base">Reels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-8">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUserId={user?.id}
              />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                  No posts yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share something amazing!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reels" className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {reels.map((reel) => (
              <ReelCard 
                key={reel.id} 
                reel={reel} 
                currentUserId={user?.id}
              />
            ))}
            {reels.length === 0 && (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                  No reels yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share a reel!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {showAuth && (
        <AuthDialog onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default Index;
