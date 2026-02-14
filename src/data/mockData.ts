// Mock data for the Instagram-like platform
export const mockUsers = [
  {
    id: '1',
    username: 'sarah_chen',
    display_name: 'Sarah Chen',
    bio: 'Photography enthusiast 📸 | Travel lover ✈️',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop'
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
    id: '550e8400-e29b-41d4-a716-446655440001',
    user_id: '1',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
    caption: 'Portrait mode hits different 📸✨ Loving the golden hour vibes!',
    likes_count: 124,
    created_at: '2024-01-15T18:30:00Z',
    profiles: mockUsers[0]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    user_id: '2',
    image_url: 'https://plus.unsplash.com/premium_photo-1682096259050-361e2989706d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=600&fit=crop',
    caption: 'Homemade pizza night! 🍕 Nothing beats fresh ingredients and good company.',
    likes_count: 89,
    created_at: '2024-01-15T19:15:00Z',
    profiles: mockUsers[1]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    user_id: '3',
    image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=600&fit=crop',
    caption: 'Working on some exciting new designs ✨ Can\'t wait to share the final results!',
    likes_count: 156,
    created_at: '2024-01-15T20:00:00Z',
    profiles: mockUsers[2]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    user_id: '4',
    image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop',
    caption: 'Weekend vibes with the squad! 🏔️ Adventure buddies for life.',
    likes_count: 203,
    created_at: '2024-01-15T16:45:00Z',
    profiles: mockUsers[3]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    user_id: '5',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
    caption: 'Morning workout complete! 💪 Remember, consistency is key to reaching your goals.',
    likes_count: 78,
    created_at: '2024-01-15T07:30:00Z',
    profiles: mockUsers[4]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    user_id: '1',
    image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=600&fit=crop',
    caption: 'Coffee date with my favorite person ☕❤️ Perfect morning!',
    likes_count: 92,
    created_at: '2024-01-15T09:00:00Z',
    profiles: mockUsers[0]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    user_id: '2',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
    caption: 'Fresh pasta made from scratch! 🍝 There\'s nothing quite like homemade Italian cuisine.',
    likes_count: 167,
    created_at: '2024-01-14T18:20:00Z',
    profiles: mockUsers[1]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    user_id: '3',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=600&fit=crop',
    caption: 'New UI design system coming together 🎨 Loving these color combinations!',
    likes_count: 234,
    created_at: '2024-01-14T15:30:00Z',
    profiles: mockUsers[2]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    user_id: '4',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop',
    caption: 'Exploring new places with good company 🌄 Adventure mode: ON!',
    likes_count: 189,
    created_at: '2024-01-14T06:15:00Z',
    profiles: mockUsers[3]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    user_id: '5',
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop',
    caption: 'Leg day conquered! 🦵 Push yourself because no one else is going to do it for you.',
    likes_count: 142,
    created_at: '2024-01-14T10:45:00Z',
    profiles: mockUsers[4]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    user_id: '1',
    image_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=600&fit=crop',
    caption: 'Golden hour portraits with my bestie ✨ She makes every photo better!',
    likes_count: 298,
    created_at: '2024-01-13T17:30:00Z',
    profiles: mockUsers[0]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    user_id: '2',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop',
    caption: 'Pancake Sunday! 🥞 The perfect way to start a lazy weekend morning.',
    likes_count: 176,
    created_at: '2024-01-13T09:00:00Z',
    profiles: mockUsers[1]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    user_id: '3',
    image_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=600&fit=crop',
    caption: 'Workspace setup complete! 💻 Ready to create some amazing designs today.',
    likes_count: 211,
    created_at: '2024-01-13T08:30:00Z',
    profiles: mockUsers[2]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    user_id: '4',
    image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop',
    caption: 'Weekend getaway with the crew 🏕️⭐ Making memories!',
    likes_count: 256,
    created_at: '2024-01-12T21:00:00Z',
    profiles: mockUsers[3]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    user_id: '5',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
    caption: 'Post-workout smoothie bowl 🥤 Fuel your body with the good stuff!',
    likes_count: 134,
    created_at: '2024-01-12T11:30:00Z',
    profiles: mockUsers[4]
  }
];

export const mockReels = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    user_id: '1',
    video_url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=700&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=700&fit=crop',
    caption: 'Behind the lens 📸✨',
    likes_count: 432,
    views_count: 5234,
    created_at: '2024-01-15T12:30:00Z',
    profiles: mockUsers[0]
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    user_id: '2',
    video_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=700&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=700&fit=crop',
    caption: 'Quick cooking tip! 🍳',
    likes_count: 891,
    views_count: 12453,
    created_at: '2024-01-15T14:20:00Z',
    profiles: mockUsers[1]
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    user_id: '3',
    video_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=700&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=700&fit=crop',
    caption: 'Design process ✨',
    likes_count: 623,
    views_count: 8932,
    created_at: '2024-01-15T10:15:00Z',
    profiles: mockUsers[2]
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    user_id: '4',
    video_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=700&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=700&fit=crop',
    caption: 'Adventure crew 🏔️',
    likes_count: 1243,
    views_count: 18765,
    created_at: '2024-01-14T16:45:00Z',
    profiles: mockUsers[3]
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    user_id: '5',
    video_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=700&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=700&fit=crop',
    caption: 'Fitness motivation 💪',
    likes_count: 756,
    views_count: 11234,
    created_at: '2024-01-14T08:30:00Z',
    profiles: mockUsers[4]
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440006',
    user_id: '1',
    video_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=700&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=700&fit=crop',
    caption: 'Portrait session ✨',
    likes_count: 987,
    views_count: 15432,
    created_at: '2024-01-13T18:00:00Z',
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