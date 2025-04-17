import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Post } from '../../types/feed';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share, MoreHorizontal, Bookmark } from 'lucide-react';
import CommentSection from './CommentSection';
import { getShadowStyles } from '../../styles/global';
import { useToast } from '../ui/use-toast';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.likes.reacted);
  const [likeCount, setLikeCount] = useState(post.likes.count);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  
  const heartScale = useRef(new Animated.Value(1)).current;
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
      // Animate heart
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    }
    setLiked(prev => !prev);
  };

  const handleShare = () => {
    toast({
      title: "Share post",
      description: "Post sharing functionality would open here",
    });
  };
  
  const handleSave = () => {
    setSaved(!saved);
    toast({
      title: saved ? "Post removed from bookmarks" : "Post saved to bookmarks",
      description: saved ? "The post has been removed from your bookmarks" : "You can find this post in your bookmarks",
    });
  };

  const formattedTime = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <View style={[styles.container, getShadowStyles(2)]}>
      <View style={styles.innerContainer}>
        {/* Post Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar src={post.user.avatar} alt={post.user.name} border />
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{post.user.name}</Text>
              <Text style={styles.timestamp}>{formattedTime}</Text>
            </View>
          </View>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Bookmark 
                width={20} 
                height={20} 
                color={saved ? "#8B5CF6" : "#6B7280"} 
                fill={saved ? "#8B5CF6" : "transparent"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MoreHorizontal width={20} height={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{post.content}</Text>
        </View>

        {/* Post Image (if any) */}
        {post.image && (
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => {
              toast({
                title: "Image Viewer",
                description: "Full-size image viewer would open here",
              });
            }}
          >
            <Image 
              source={{ uri: post.image }} 
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* Post Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.likeCounter}>
            <View style={styles.likeIconContainer}>
              <Heart width={12} height={12} color="white" fill="white" />
            </View>
            <Text style={styles.statText}>{likeCount}</Text>
          </View>
          <View style={styles.rightStats}>
            <TouchableOpacity onPress={() => setShowComments(!showComments)}>
              <Text style={styles.statActionText}>{post.comments.length} comments</Text>
            </TouchableOpacity>
            <Text style={styles.statText}>{post.shares} shares</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={[styles.actionBarButton, liked && styles.activeActionButton]} 
            onPress={handleLike}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Heart 
                width={20} 
                height={20} 
                color={liked ? "#8B5CF6" : "#6B7280"} 
                fill={liked ? "#8B5CF6" : "transparent"}
              />
            </Animated.View>
            <Text style={[styles.actionBarText, liked && styles.activeActionText]}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBarButton, showComments && styles.activeActionButton]} 
            onPress={() => setShowComments(!showComments)}
          >
            <MessageSquare width={20} height={20} color="#6B7280" />
            <Text style={styles.actionBarText}>Comment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBarButton}
            onPress={handleShare}
          >
            <Share width={20} height={20} color="#6B7280" />
            <Text style={styles.actionBarText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post.id} comments={post.comments} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  innerContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userTextContainer: {
    marginLeft: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937', // gray-800
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151', // gray-700
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  likeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIconContainer: {
    backgroundColor: '#8B5CF6', // purple-500
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  rightStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  statActionText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB', // gray-200
    marginVertical: 12,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeActionButton: {
    backgroundColor: '#F3F4F6', // gray-100
  },
  actionBarText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  activeActionText: {
    color: '#8B5CF6', // purple-500
    fontWeight: '500',
  },
});

export default PostCard;
