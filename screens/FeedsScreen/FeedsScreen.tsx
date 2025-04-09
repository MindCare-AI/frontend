import React from 'react';
import { mockPosts } from '../../constants/mockFeeds';
import PostCard from './components/PostCard';
import CreatePostCard from './components/CreatePostCard';
import { Bell, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
const Feeds = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-mindcare-purple">Mindcare AI</h1>
          
          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5 flex-1 max-w-xs mx-4">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <Input 
              type="search" 
              placeholder="Search..."
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-4">
        <div className="feed-container">
          {/* Create Post Card */}
          <CreatePostCard />
          
          {/* Posts Feed */}
          <div>
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feeds;
