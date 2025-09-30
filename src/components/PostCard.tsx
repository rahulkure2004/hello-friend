import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface Post {
  id: string;
  image_url: string;
  caption?: string;
  likes_count: number;
  created_at: string;
  profiles: Profile;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    if (currentUserId) {
      checkIfLiked();
    }
    
    // Set up real-time subscription for comments
    const channel = supabase
      .channel(`post-${post.id}-comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`
        },
        (payload) => {
          // Fetch the new comment with profile data
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, currentUserId]);

  const fetchComments = async () => {
    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('id, content, created_at, is_hidden, moderation_reason, user_id')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return;
    }

    if (!commentsData || commentsData.length === 0) {
      setComments([]);
      return;
    }

    // Fetch profiles for comment authors
    const userIds = commentsData.map(comment => comment.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    // Join comments with profiles
    const commentsWithProfiles = commentsData.map(comment => {
      const profile = profilesData?.find(p => p.user_id === comment.user_id);
      return {
        ...comment,
        profiles: profile || { username: 'Unknown', display_name: 'Unknown User', avatar_url: '' }
      };
    });

    setComments(commentsWithProfiles);
  };

  const checkIfLiked = async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();

    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);
        
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: currentUserId });
        
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!currentUserId) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);
    
    try {
      // First, moderate the comment using our AI service
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

      // Insert the comment with moderation results
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: newComment.trim(),
          is_hidden: isHarmful,
          moderation_reason: isHarmful ? reason : null
        });

      if (commentError) {
        console.error('Error adding comment:', commentError);
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
        });
      } else {
        setNewComment("");
        
        if (isHarmful) {
          toast({
            title: "Comment Hidden",
            description: "Your comment was flagged and hidden for: " + reason,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Comment added",
            description: "Your comment has been posted successfully.",
          });
        }
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
    <Card className="w-full max-w-md mx-auto overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profiles.avatar_url} />
            <AvatarFallback>{post.profiles.display_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.profiles.username}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Image */}
      <div className="aspect-square overflow-hidden">
        <img 
          src={post.image_url} 
          alt="Post content"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`p-0 h-auto ${isLiked ? 'text-like hover:text-like/80' : 'hover:text-muted-foreground'}`}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Share className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Likes count */}
        <p className="font-semibold text-sm mb-2">{likesCount} likes</p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-3">
            <span className="font-semibold">{post.profiles.username}</span> {post.caption}
          </p>
        )}

        {/* Comments */}
        <div className="space-y-2 mb-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              {comment.is_hidden ? (
                <p className="text-xs text-muted-foreground italic">
                  Comment hidden: {comment.moderation_reason}
                </p>
              ) : (
                <p className="text-sm">
                  <span className="font-semibold">{comment.profiles.username}</span> {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Add comment */}
        {currentUserId && (
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              disabled={isLoading}
              className="flex-1 border-0 p-0 focus-visible:ring-0 text-sm"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleComment}
              disabled={!newComment.trim() || isLoading}
              className="text-primary hover:text-primary/80 p-0 h-auto font-semibold"
            >
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}