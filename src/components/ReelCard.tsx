import { useState } from "react";
import { Heart, MessageCircle, Share, Play, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface Reel {
  id: string;
  video_url: string;
  thumbnail_url: string;
  caption?: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  profiles: Profile;
}

interface ReelCardProps {
  reel: Reel;
  currentUserId?: string;
}

export function ReelCard({ reel, currentUserId }: ReelCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const { toast } = useToast();

  const handleLike = () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like reels",
        variant: "destructive",
      });
      return;
    }

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleComment = () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Coming soon",
      description: "Comments on reels will be available soon!",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share",
      description: "Share functionality coming soon!",
    });
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border-0 bg-card shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative aspect-[9/16] bg-muted">
        <img
          src={reel.thumbnail_url}
          alt={reel.caption || "Reel"}
          className="w-full h-full object-cover"
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Views count */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            {reel.views_count >= 1000 
              ? `${(reel.views_count / 1000).toFixed(1)}K` 
              : reel.views_count}
          </span>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* User info and actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={reel.profiles.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {reel.profiles.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-white text-sm">
                  {reel.profiles.display_name}
                </span>
              </div>
              {reel.caption && (
                <p className="text-white text-sm line-clamp-2">
                  {reel.caption}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col items-center gap-4 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={`rounded-full w-12 h-12 ${
                  isLiked 
                    ? "bg-primary/20 hover:bg-primary/30" 
                    : "bg-white/20 hover:bg-white/30"
                } backdrop-blur-sm`}
              >
                <Heart
                  className={`w-6 h-6 ${isLiked ? "fill-primary text-primary" : "text-white"}`}
                />
              </Button>
              <span className="text-white text-sm font-medium">
                {likesCount >= 1000 
                  ? `${(likesCount / 1000).toFixed(1)}K` 
                  : likesCount}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleComment}
                className="rounded-full w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Share className="w-6 h-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
