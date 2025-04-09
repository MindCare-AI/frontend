import React, { useState } from 'react';
import Avatar from './Avatar';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/textarea';
import { ImageIcon, SendHorizontal } from 'lucide-react';
import { useToast } from "../../../components/ui/use-toast";
import { Separator } from '../../../components/ui/separator';

const CreatePostCard = () => {
  const [postContent, setPostContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postContent.trim()) return;
    
    // In a real app, we would send this to an API
    toast({
      title: "Post created!",
      description: "Your post has been shared with the community.",
    });
    
    // Reset form
    setPostContent('');
    setIsExpanded(false);
  };

  return (
    <div className="post-card mb-4">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar src="/placeholder.svg" alt="You" />
            {!isExpanded ? (
              <div 
                className="bg-gray-100 flex-1 px-4 py-2.5 rounded-full text-gray-500 cursor-text"
                onClick={() => setIsExpanded(true)}
              >
                What's on your mind?
              </div>
            ) : (
              <div className="flex-1">
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your thoughts or experience..."
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50 min-h-[100px] text-base"
                  autoFocus
                />
              </div>
            )}
          </div>
          
          {isExpanded && (
            <>
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-gray-600 gap-2 rounded-lg"
                  onClick={() => toast({
                    title: "Add Image",
                    description: "Image upload functionality would open here",
                  })}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Add Image</span>
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => {
                      setIsExpanded(false);
                      setPostContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!postContent.trim()}
                    className="bg-mindcare-purple hover:bg-mindcare-indigo gap-1"
                  >
                    <SendHorizontal className="h-4 w-4" />
                    Post
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePostCard;
