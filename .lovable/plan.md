

# Instagram Clone with AI Comment Moderation - Implementation Plan

## Important Platform Note

Lovable runs on **React + Vite + Tailwind + Supabase**, not Next.js/Express/Python. Here's how your requirements map:

| Your Request | Lovable Equivalent |
|---|---|
| Next.js | React + Vite (already set up) |
| Express backend | Supabase Edge Functions |
| Python FastAPI + mBERT | Lovable AI Gateway (Gemini) for moderation |
| Socket.io | Supabase Realtime |
| PostgreSQL | Supabase PostgreSQL (already connected) |
| Docker/Cloud Run | Lovable hosting (automatic) |
| JWT auth | Supabase Auth (already set up) |

## What Already Exists

- Auth (sign up / sign in / logout) with profiles table
- Post feed with mock data, likes, and AI-moderated comments
- Reels grid with mock data
- Moderation edge function (`moderate-comment`) with heuristic + AI fallback
- Messages page (empty shell)
- Favorites page (empty shell)
- Profile page (basic)

## Implementation Plan

### Phase 1: Database Schema (New Tables + Updates)

Create migrations for:

- **reels** table: `id, user_id, video_url, thumbnail_url, caption, likes_count, views_count, created_at`
- **reel_likes** table: `id, user_id, reel_id, created_at` (unique constraint on user_id + reel_id)
- **reel_comments** table: `id, user_id, reel_id, content, is_hidden, moderation_reason, status (approved/blocked), confidence, language, created_at`
- **chats** table: `id, created_at, updated_at`
- **chat_participants** table: `id, chat_id, user_id, joined_at`
- **messages** table: `id, chat_id, sender_id, content, created_at, read_at`
- **moderation_logs** table: `id, comment_id, reel_comment_id, original_content, status (approved/blocked), confidence, language, reason, created_at`
- Update **comments** table: add `status` (approved/blocked), `confidence`, `language` columns
- Add **RLS policies** for all tables
- Enable **Supabase Realtime** on messages table

### Phase 2: Post Creation with Image Upload

- Set up a **Supabase Storage bucket** ("post-images") for image uploads
- Create a **CreatePostDialog** component with image picker + caption input
- Add a "+" button in the header for creating posts
- On submit: upload image to storage, insert post record, refresh feed
- Replace mock posts with real database queries

### Phase 3: Reel Upload and Database Integration

- Set up a **Supabase Storage bucket** ("reel-videos") for video/thumbnail uploads
- Create **CreateReelDialog** component for uploading short videos
- Replace mock reels with real database queries
- Add reel likes (database-backed) and reel comments with AI moderation
- Update `ReelCard` and `ReelDialog` to use real data

### Phase 4: Enhanced Comment Moderation

- Update the `moderate-comment` edge function to return `confidence` and `language`
- Update `PostCard` to save moderation metadata (status, confidence, language) in comments table
- Log every moderation decision to `moderation_logs` table
- Only display comments where `status = 'approved'` (blocked comments stored but hidden)
- Apply same moderation flow to reel comments

### Phase 5: Real-Time Direct Messaging

- Build chat system using **Supabase Realtime** subscriptions
- Create **chat list** showing conversations with last message preview
- Create **chat view** with message bubbles, input, and send button
- "New message" flow: search users, create chat, start messaging
- Real-time updates: new messages appear instantly via Supabase channel subscriptions
- Mark messages as read

### Phase 6: Profile Enhancements

- **Edit profile** dialog: update username, display name, bio
- **Upload profile picture**: use Supabase Storage ("avatars" bucket)
- Show user's actual posts and reels in profile grid
- Wire up post/reel counts from database

### Phase 7: Favorites Page

- Query liked posts and liked reels from database
- Display them in the existing tabbed layout
- Real-time updates when user likes/unlikes

### Phase 8: Admin Dashboard

- New `/admin` route (protected - only for admin role users)
- Stats cards: total users, posts, comments, approved vs blocked ratio
- **Recharts** charts (already installed):
  - Pie chart: approved vs blocked comments
  - Bar chart: language distribution of flagged comments
  - Line chart: moderation activity over time
- Table of recent blocked comments with content, reason, confidence
- Query data from `moderation_logs` table

### Phase 9: Delete Own Posts/Reels

- Add delete option to post/reel menu (three-dot button)
- Only show for posts/reels owned by current user
- Cascade delete associated comments, likes
- Confirm dialog before deletion

### Phase 10: Search Functionality

- Search users by username
- Navigate to user profiles
- Basic post search by caption

## Technical Details

### Supabase config.toml update
Add function entries with `verify_jwt = false` for the moderate-comment function and any new edge functions.

### Edge Function Updates
- Update `moderate-comment/index.ts` to return structured `{ isHarmful, reason, confidence, language }` and use the newer model (`google/gemini-3-flash-preview`)

### File Structure (new/modified files)
```text
src/
  components/
    CreatePostDialog.tsx      (new)
    CreateReelDialog.tsx      (new)
    EditProfileDialog.tsx     (new)
    ChatList.tsx              (new)
    ChatView.tsx              (new)
    AdminStats.tsx            (new)
  pages/
    Admin.tsx                 (new)
    Messages.tsx              (updated - full chat UI)
    Profile.tsx               (updated - edit + upload)
    Favorites.tsx             (updated - real data)
    Index.tsx                 (updated - real data + create)
  hooks/
    usePosts.ts               (new - React Query)
    useReels.ts               (new - React Query)
    useMessages.ts            (new - Realtime)
    useProfile.ts             (new)
supabase/
  migrations/
    (new migration files)
  config.toml                 (updated)
  functions/
    moderate-comment/index.ts (updated)
```

### Key Patterns
- **React Query** for data fetching and caching
- **Supabase Realtime** channels for live messaging
- **Supabase Storage** for all file uploads (images, videos, avatars)
- **RLS policies** on every table for security
- **Edge function** for AI moderation (no client-side AI calls)

