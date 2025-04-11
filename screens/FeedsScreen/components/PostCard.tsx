import React, { useState } from 'react';
import { Post } from '../../../types/feed';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share, MoreHorizontal } from 'lucide-react';
import CommentSection from './CommentSection';
import { Button } from '../../../components/ui/Button';
import { Separator } from '../../../components/ui/separator';
import { useToast } from "../../../components/ui/use-toast";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.likes.reacted);
  const [likeCount, setLikeCount] = useState(post.likes.count);
  const { toast } = useToast();
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(prev => !prev);
  };

  const handleShare = () => {
    toast({
      title: "Share post",
      description: "Post sharing functionality would open here",
    });
  };

  const formattedTime = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <div className="post-card mb-4 animate-fade-in">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <Avatar src={post.user.avatar} alt={post.user.name} />
            <div>
              <h3 className="font-medium text-mindcare-darkText">{post.user.name}</h3>
              <p className="text-xs text-gray-500">{formattedTime}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>

        {/* Post Image (if any) */}
        {post.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={post.image} alt="Post" className="w-full object-cover max-h-96" />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex justify-between items-center text-xs text-gray-500 my-2">
          <div className="flex items-center gap-1">
            <div className="bg-mindcare-purple text-white rounded-full p-0.5">
              <Heart className="h-3 w-3 fill-white" />
            </div>
            <span>{likeCount}</span>
          </div>
          <div className="flex gap-3">
            <span>{post.comments.length} comments</span>
            <span>{post.shares} shares</span>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button 
            className={`post-reaction-button ${liked ? 'active' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-mindcare-purple' : ''}`} />
            <span>Like</span>
          </button>
          
          <button 
            className="post-reaction-button"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Comment</span>
          </button>
          
          <button 
            className="post-reaction-button"
            onClick={handleShare}
          >
            <Share className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post.id} comments={post.comments} />
      )}
    </div>
  );
};

export default PostCard;
