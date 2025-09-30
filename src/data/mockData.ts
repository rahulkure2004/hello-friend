// Mock data for the Instagram-like platform
export const mockUsers = [
  {
    id: '1',
    username: 'sarah_chen',
    display_name: 'Sarah Chen',
    bio: 'Photography enthusiast 📸 | Travel lover ✈️',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2', 
    username: 'alex_rodriguez',
    display_name: 'Alex Rodriguez',
    bio: 'Food blogger 🍕 | Chef in training 👨‍🍳',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    username: 'emma_design',
    display_name: 'Emma Wilson',
    bio: 'UI/UX Designer 🎨 | Creating beautiful interfaces',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    username: 'mike_outdoors',
    display_name: 'Mike Johnson',
    bio: 'Adventure seeker 🏔️ | Mountain climbing enthusiast',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '5',
    username: 'lisa_fitness',
    display_name: 'Lisa Martinez',
    bio: 'Fitness coach 💪 | Helping you reach your goals',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  }
];

export const mockPosts = [
  {
    id: '1',
    user_id: '1',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
    caption: 'Beautiful sunset at the beach 🌅 Perfect end to a wonderful day!',
    likes_count: 124,
    created_at: '2024-01-15T18:30:00Z',
    profiles: mockUsers[0]
  },
  {
    id: '2',
    user_id: '2', 
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=600&fit=crop',
    caption: 'Homemade pizza night! 🍕 Nothing beats fresh ingredients and good company.',
    likes_count: 89,
    created_at: '2024-01-15T19:15:00Z',
    profiles: mockUsers[1]
  },
  {
    id: '3',
    user_id: '3',
    image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=600&fit=crop',
    caption: 'Working on some exciting new designs ✨ Can\'t wait to share the final results!',
    likes_count: 156,
    created_at: '2024-01-15T20:00:00Z',
    profiles: mockUsers[2]
  },
  {
    id: '4',
    user_id: '4',
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=600&h=600&fit=crop',
    caption: 'Reached the summit today! 🏔️ The view was absolutely incredible. Worth every step.',
    likes_count: 203,
    created_at: '2024-01-15T16:45:00Z',
    profiles: mockUsers[3]
  },
  {
    id: '5',
    user_id: '5',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
    caption: 'Morning workout complete! 💪 Remember, consistency is key to reaching your goals.',
    likes_count: 78,
    created_at: '2024-01-15T07:30:00Z',
    profiles: mockUsers[4]
  },
  {
    id: '6',
    user_id: '1',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
    caption: 'Coffee and cameras ☕📷 My favorite combination for a productive morning.',
    likes_count: 92,
    created_at: '2024-01-15T09:00:00Z',
    profiles: mockUsers[0]
  }
];

export const mockComments = [
  {
    id: '1',
    post_id: '1',
    user_id: '2',
    content: 'Absolutely stunning! 😍',
    is_hidden: false,
    moderation_reason: null,
    created_at: '2024-01-15T18:35:00Z',
    profiles: mockUsers[1]
  },
  {
    id: '2',
    post_id: '1', 
    user_id: '3',
    content: 'I love the colors in this shot!',
    is_hidden: false,
    moderation_reason: null,
    created_at: '2024-01-15T18:40:00Z',
    profiles: mockUsers[2]
  },
  {
    id: '3',
    post_id: '2',
    user_id: '1',
    content: 'That looks delicious! Recipe please? 🤤',
    is_hidden: false,
    moderation_reason: null,
    created_at: '2024-01-15T19:20:00Z',
    profiles: mockUsers[0]
  }
];