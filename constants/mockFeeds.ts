import { Post } from '../types/feed';

export const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Jessica Wong',
      avatar: '/placeholder.svg',
    },
    content: "Just finished a 20-minute meditation session and feeling so centered! It's amazing how taking just a few moments for mindfulness can completely shift your perspective. How do you all incorporate mindfulness into your daily routines? #MindcareAI #MindfulnessMatters",
    timestamp: '2025-04-08T14:30:00Z',
    likes: { count: 24, reacted: false },
    comments: [
      {
        id: 'comment1',
        user: {
          id: 'user2',
          name: 'Michael Chen',
          avatar: '/placeholder.svg',
        },
        content: "I've been trying to meditate every morning before work. It really helps set the tone for the day!",
        timestamp: '2025-04-08T15:10:00Z',
        likes: 5,
      },
      {
        id: 'comment2',
        user: {
          id: 'user3',
          name: 'Sarah Johnson',
          avatar: '/placeholder.svg',
        },
        content: "Which meditation track did you use? I'm looking for new recommendations!",
        timestamp: '2025-04-08T15:45:00Z',
        likes: 3,
      },
    ],
    shares: 7,
  },
  {
    id: '2',
    user: {
      id: 'user4',
      name: 'David Miller',
      avatar: '/placeholder.svg',
    },
    content: "Today's self-care reminder: It's okay to take breaks. It's okay to say no. It's okay to prioritize your mental health. You don't need to be productive every minute of every day. Rest is productive too. #SelfCareJourney",
    image: '/placeholder.svg',
    timestamp: '2025-04-08T12:15:00Z',
    likes: { count: 56, reacted: true },
    comments: [
      {
        id: 'comment3',
        user: {
          id: 'user5',
          name: 'Emma Williams',
          avatar: '/placeholder.svg',
        },
        content: 'Needed to hear this today. Thank you!',
        timestamp: '2025-04-08T13:20:00Z',
        likes: 12,
      },
    ],
    shares: 14,
  },
  {
    id: '3',
    user: {
      id: 'user6',
      name: 'Alex Thompson',
      avatar: '/placeholder.svg',
    },
    content: "Just tried the new guided journaling feature in Mindcare AI and wow! I've been struggling with anxiety lately, and the prompts helped me identify some triggers I wasn't even aware of. Has anyone else found journaling helpful for managing anxiety?",
    timestamp: '2025-04-07T18:45:00Z',
    likes: { count: 42, reacted: false },
    comments: [
      {
        id: 'comment4',
        user: {
          id: 'user7',
          name: 'Olivia Garcia',
          avatar: '/placeholder.svg',
        },
        content: "Journaling has been a game-changer for me! I'll have to try that feature.",
        timestamp: '2025-04-07T19:30:00Z',
        likes: 8,
      },
      {
        id: 'comment5',
        user: {
          id: 'user8',
          name: 'James Wilson',
          avatar: '/placeholder.svg',
        },
        content: "Which specific prompts did you find most helpful? I'm still figuring out how to get the most out of journaling.",
        timestamp: '2025-04-07T20:15:00Z',
        likes: 4,
      },
    ],
    shares: 9,
  },
];