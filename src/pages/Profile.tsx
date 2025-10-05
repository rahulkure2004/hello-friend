import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Grid3x3, Bookmark, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockPosts } from "@/data/mockData";

interface User {
  id: string;
  email?: string;
}

interface Profile {
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/');
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/');
        } else {
          setUser(session.user);
          fetchProfile(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username, display_name, bio, avatar_url')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    setProfile(profileData);

    // Fetch posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    setPostsCount(postsCount || 0);

    // Mock data for followers/following (not in database yet)
    setFollowersCount(Math.floor(Math.random() * 1000));
    setFollowingCount(Math.floor(Math.random() * 500));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center mb-8">
          {/* Avatar */}
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/20">
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              {profile.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-semibold">{profile.username}</h1>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="shrink-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              <div className="text-center">
                <div className="font-semibold text-lg">{postsCount}</div>
                <div className="text-sm text-muted-foreground">posts</div>
              </div>
              <button className="text-center hover:opacity-70 transition-opacity">
                <div className="font-semibold text-lg">{followersCount}</div>
                <div className="text-sm text-muted-foreground">followers</div>
              </button>
              <button className="text-center hover:opacity-70 transition-opacity">
                <div className="font-semibold text-lg">{followingCount}</div>
                <div className="text-sm text-muted-foreground">following</div>
              </button>
            </div>

            {/* Bio */}
            <div>
              <h2 className="font-semibold mb-1">{profile.display_name}</h2>
              {profile.bio && (
                <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 border-t">
            <TabsTrigger value="posts" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="tagged" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tagged</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {postsCount > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {mockPosts.slice(0, 9).map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square overflow-hidden rounded-sm hover:opacity-90 transition-opacity cursor-pointer bg-muted"
                  >
                    <img
                      src={post.image_url}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
                  <Grid3x3 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground">Share your first post to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
                <Bookmark className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Saved Posts</h3>
              <p className="text-muted-foreground">Save posts to view them later</p>
            </div>
          </TabsContent>

          <TabsContent value="tagged">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Tagged Posts</h3>
              <p className="text-muted-foreground">Posts you're tagged in will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
