export interface User {
    id: string;
    name: string;
    avatar: string;
  }
  
  export interface Comment {
    id: string;
    user: User;
    content: string;
    timestamp: string;
    likes: number;
  }
  
  export interface Reaction {
    count: number;
    reacted: boolean;
  }
  
  export interface Post {
    id: string;
    user: User;
    content: string;
    image?: string;
    timestamp: string;
    likes: Reaction;
    comments: Comment[];
    shares: number;
  }
  