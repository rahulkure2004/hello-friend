-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

-- Create policy: Everyone can see non-hidden comments
CREATE POLICY "Public can view non-hidden comments" 
ON public.comments 
FOR SELECT 
USING (is_hidden = false OR is_hidden IS NULL);

-- Create policy: Users can see their own comments including hidden ones
CREATE POLICY "Users can view their own comments including moderation details" 
ON public.comments 
FOR SELECT 
USING (auth.uid() = user_id);