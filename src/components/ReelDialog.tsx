import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, X, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  moderation_reason?: string;
  profiles: Profile;
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

interface ReelDialogProps {
  reel: Reel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

export function ReelDialog({ reel, open, onOpenChange, currentUserId }: ReelDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, reel.id]);

  const fetchComments = async () => {
    // For now, we'll show empty comments as reels aren't in the database yet
    setComments([]);
  };

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

  const handleComment = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);
    
    try {
      // Moderate the comment using our AI service
      const moderationResponse = await supabase.functions.invoke('moderate-comment', {
        body: { comment: newComment.trim() }
      });

      if (moderationResponse.error) {
        console.error('Moderation error:', moderationResponse.error);
        toast({
          title: "Error",
          description: "Failed to process comment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: moderationData } = moderationResponse;
      const { isHarmful, reason } = moderationData;

      if (isHarmful) {
        toast({
          title: "Comment Blocked",
          description: "Your comment was flagged for: " + reason,
          variant: "destructive",
        });
      } else {
        // Add comment to local state (since reels aren't in DB yet)
        const newCommentObj: Comment = {
          id: Date.now().toString(),
          content: newComment.trim(),
          created_at: new Date().toISOString(),
          is_hidden: false,
          moderation_reason: null,
          profiles: {
            username: "You",
            display_name: "You",
            avatar_url: ""
          }
        };
        setComments([...comments, newCommentObj]);
        setNewComment("");
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        });
      }
    } catch (error) {
      console.error('Error processing comment:', error);
      toast({
        title: "Error",
        description: "Failed to process comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <div className="grid md:grid-cols-2 h-full">
          {/* Video Side */}
          <div className="relative bg-black flex items-center justify-center">
            <img
              src={reel.thumbnail_url}
              alt={reel.caption || "Reel"}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">
                {reel.views_count >= 1000 
                  ? `${(reel.views_count / 1000).toFixed(1)}K` 
                  : reel.views_count}
              </span>
            </div>
          </div>

          {/* Comments Side */}
          <div className="flex flex-col h-full bg-card">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={reel.profiles.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {reel.profiles.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{reel.profiles.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{reel.profiles.username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Caption */}
            {reel.caption && (
              <div className="p-4 border-b">
                <p className="text-sm">{reel.caption}</p>
              </div>
            )}

            {/* Comments */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {comment.is_hidden ? (
                        <p className="text-xs text-muted-foreground italic">
                          Comment hidden: {comment.moderation_reason}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-semibold">{comment.profiles.username}</p>
                          <p className="text-sm">{comment.content}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className={isLiked ? "text-primary" : ""}
                >
                  <Heart
                    className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>
                <span className="text-sm font-semibold">
                  {likesCount >= 1000 
                    ? `${(likesCount / 1000).toFixed(1)}K` 
                    : likesCount} likes
                </span>
                <Button variant="ghost" size="icon">
                  <Share className="w-6 h-6" />
                </Button>
              </div>

              {/* Add comment */}
              {currentUserId && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleComment}
                    disabled={!newComment.trim() || isLoading}
                  >
                    {isLoading ? "Posting..." : "Post"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
