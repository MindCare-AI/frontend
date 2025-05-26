export interface User {
  id: number;
  username: string;
  name?: string;
  profile_pic?: string;
}

export interface Reaction {
  user: User;
  reaction_type: string;
  created_at: string;
}

export interface ReactionSummary {
  like?: number;
  love?: number;
  support?: number;
  insightful?: number;
  celebrate?: number;
}

export interface MediaFile {
  id: number;
  file: string;
  media_type: string;
  uploaded_by: User;
}

export interface Topic {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface PollOption {
  id: number;
  post: number;
  option_text: string;
  votes_count: number;
  user_has_voted: boolean;
}

export interface Comment {
  id: number;
  post: number;
  author: number;
  author_name: string;
  author_profile_pic?: string;
  content: string;
  parent?: number;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  reactions_count: number;
  replies_count: number;
  current_user_reaction?: string | null;
}

export interface Post {
  id: number;
  author: number;
  author_name: string;
  author_profile_pic?: string;
  author_user_type?: 'patient' | 'therapist';
  content: string;
  post_type: string;
  topics?: string | Topic;
  visibility: string;
  created_at: string;
  updated_at: string;
  media_files?: MediaFile[];
  link_url?: string;
  views_count: number;
  tags?: string;
  reactions_summary: ReactionSummary;
  current_user_reaction?: string | null;
  comments_count: number;
  poll_options?: PollOption[];
}

export interface FilterState {
  topics: string[];
  types: string[];
  tags: string[];
  users: string[];
}

export type SortOption = 'newest' | 'most-viewed' | 'most-reactions';
