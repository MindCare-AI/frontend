import React, { useState } from 'react';
import { Comment } from '../../../types/feed';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, SendHorizontal } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection = ({ postId, comments }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>(comments);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const currentUser = {
      id: 'currentUser',
      name: 'You',
      avatar: '/placeholder.svg',
    };
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      user: currentUser,
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
    };
    
    setCommentsList(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-b-xl">
      <Separator className="mb-3" />
      
      {/* Add Comment Form */}
      <form 
        className="flex items-center gap-2 mb-4" 
        onSubmit={handleSubmitComment}
      >
        <Avatar src="/placeholder.svg" alt="You" size="sm" />
        <div className="flex-1 relative">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="pr-10 bg-white rounded-full border-gray-200"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-mindcare-purple hover:text-mindcare-indigo p-1"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </form>
      
      {/* Comments List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {commentsList.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar src={comment.user.avatar} alt={comment.user.name} size="sm" />
            <div className="flex-1">
              <div className="bg-white p-2.5 rounded-xl">
                <p className="text-sm font-medium">{comment.user.name}</p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <button className="hover:text-mindcare-purple flex items-center gap-1">
                  <Heart className="h-3 w-3" /> 
                  {comment.likes > 0 && <span>{comment.likes}</span>}
                  Like
                </button>
                <span>{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;