export interface Author {
  id: string
  name: string
  avatar: string
}

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Post {
  id: string
  author: Author
  content: string
  created_at: string
  topic?: string
  post_type: "text" | "image" | "video" | "poll"
  media_url?: string | null
  link_url?: string | null
  tags?: string[]
  poll_options?: PollOption[]
  user_poll_vote?: string | null
  reactions: {
    like: number
    love: number
    support: number
    insightful: number
    celebrate: number
  }
  user_reaction: string | null
  comments_count: number
  views_count: number
  is_saved: boolean
}

export interface Comment {
  id: string
  author: Author
  content: string
  created_at: string
  is_edited: boolean
  reactions: {
    like: number
  }
  user_reaction: string | null
  replies_count: number
  replies?: Comment[]
}

export interface FilterState {
  topics: string[]
  types: string[]
  tags: string[]
  users: string[]
}
