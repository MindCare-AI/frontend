import type { Post, Comment } from "../../types/feeds/feed"

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Jane Cooper",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    },
    content: "Just launched our new product! Check it out and let me know what you think. #ProductLaunch #Excited",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    topic: "Technology",
    post_type: "text",
    media_url: null,
    link_url: "https://example.com/product",
    tags: ["ProductLaunch", "Technology"],
    reactions: {
      like: 24,
      love: 15,
      support: 5,
      insightful: 8,
      celebrate: 12,
    },
    user_reaction: "like",
    comments_count: 8,
    views_count: 142,
    is_saved: false,
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "Alex Morgan",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    content: "Our team just won the championship! So proud of everyone's hard work and dedication.",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    topic: "Sports",
    post_type: "image",
    media_url: "https://source.unsplash.com/random/600x400/?sports",
    link_url: null,
    tags: ["Sports", "Championship"],
    reactions: {
      like: 56,
      love: 32,
      support: 14,
      insightful: 0,
      celebrate: 28,
    },
    user_reaction: "celebrate",
    comments_count: 15,
    views_count: 230,
    is_saved: true,
  },
  {
    id: "3",
    author: {
      id: "user3",
      name: "Taylor Swift",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    content: "Which feature would you like to see in our next update?",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    topic: "Business",
    post_type: "poll",
    media_url: null,
    link_url: null,
    tags: ["Feedback", "ProductDevelopment"],
    poll_options: [
      { id: "opt1", text: "Dark mode", votes: 342 },
      { id: "opt2", text: "Voice commands", votes: 128 },
      { id: "opt3", text: "Offline mode", votes: 256 },
      { id: "opt4", text: "Custom themes", votes: 184 },
    ],
    user_poll_vote: "opt1",
    reactions: {
      like: 18,
      love: 5,
      support: 2,
      insightful: 12,
      celebrate: 0,
    },
    user_reaction: null,
    comments_count: 24,
    views_count: 910,
    is_saved: false,
  },
  {
    id: "4",
    author: {
      id: "user4",
      name: "Robert Johnson",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    content: "Check out this amazing tutorial on building modern web applications!",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    topic: "Technology",
    post_type: "video",
    media_url: "https://source.unsplash.com/random/600x400/?coding",
    link_url: "https://example.com/tutorial",
    tags: ["WebDev", "Tutorial", "Programming"],
    reactions: {
      like: 45,
      love: 22,
      support: 8,
      insightful: 36,
      celebrate: 5,
    },
    user_reaction: "insightful",
    comments_count: 12,
    views_count: 567,
    is_saved: false,
  },
]

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "comment1",
    author: {
      id: "user5",
      name: "Emily Johnson",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    content: "This is really impressive! I've been looking for something like this for a while.",
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    is_edited: false,
    reactions: {
      like: 5,
    },
    user_reaction: "like",
    replies_count: 2,
    replies: [
      {
        id: "reply1",
        author: {
          id: "user1",
          name: "Jane Cooper",
          avatar: "https://randomuser.me/api/portraits/women/10.jpg",
        },
        content: "Thanks Emily! I'm glad you like it.",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        is_edited: false,
        reactions: {
          like: 2,
        },
        user_reaction: null,
        replies_count: 0,
      },
      {
        id: "reply2",
        author: {
          id: "user6",
          name: "Michael Brown",
          avatar: "https://randomuser.me/api/portraits/men/15.jpg",
        },
        content: "I agree with Emily, this is fantastic work!",
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        is_edited: true,
        reactions: {
          like: 1,
        },
        user_reaction: null,
        replies_count: 0,
      },
    ],
  },
  {
    id: "comment2",
    author: {
      id: "user7",
      name: "David Wilson",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    content: "Have you considered adding support for dark mode? That would be a great addition.",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    is_edited: false,
    reactions: {
      like: 3,
    },
    user_reaction: null,
    replies_count: 1,
    replies: [
      {
        id: "reply3",
        author: {
          id: "user1",
          name: "Jane Cooper",
          avatar: "https://randomuser.me/api/portraits/women/10.jpg",
        },
        content: "That's a great suggestion! We're actually working on that for the next update.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        is_edited: false,
        reactions: {
          like: 2,
        },
        user_reaction: null,
        replies_count: 0,
      },
    ],
  },
]
