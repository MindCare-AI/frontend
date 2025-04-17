import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Animated } from 'react-native';
import { Comment } from '../../types/feed';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Send, MoreHorizontal, Smile } from 'lucide-react';
import { getShadowStyles } from '../../styles/global';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection = ({ postId, comments }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>(comments || []);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const inputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const currentUser = {
      id: 'currentUser',
      name: 'You',
      avatar: 'https://via.placeholder.com/100',
    };

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      user: currentUser,
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setCommentsList((prev) => [comment, ...prev]);
    setNewComment('');
  };
  
  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const newState = { ...prev, [commentId]: !prev[commentId] };
      return newState;
    });
    
    setCommentsList(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: likedComments[commentId] ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isLiked = likedComments[item.id];
    const scaleAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={[
        styles.commentContainer,
        { opacity: scaleAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <Avatar src={item.user.avatar} alt={item.user.name} size="sm" />
        <View style={styles.commentContent}>
          <View style={[styles.commentBubble, getShadowStyles(1)]}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUserName}>{item.user.name}</Text>
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal width={12} height={12} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={() => handleLikeComment(item.id)}
            >
              <Heart 
                width={12} 
                height={12} 
                color={isLiked ? "#8B5CF6" : "#6B7280"} 
                fill={isLiked ? "#8B5CF6" : "transparent"} 
              />
              {item.likes > 0 && (
                <Text style={[styles.likeCount, isLiked && styles.likedText]}>
                  {item.likes}
                </Text>
              )}
              <Text style={[styles.likeText, isLiked && styles.likedText]}>Like</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Add Comment Form */}
      <View style={styles.commentForm}>
        <Avatar src="https://via.placeholder.com/100" alt="You" size="sm" />
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            style={styles.input}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSubmitComment}
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputActionButton}>
              <Smile width={20} height={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !newComment.trim() && styles.disabledButton
              ]}
              disabled={!newComment.trim()}
              onPress={handleSubmitComment}
            >
              <Send width={20} height={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Comments List */}
      <FlatList
        data={commentsList}
        keyExtractor={item => item.id}
        renderItem={renderCommentItem}
        contentContainerStyle={styles.commentsList}
        ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
        ListFooterComponent={
          commentsList.length > 3 ? (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View more comments</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB', // gray-50
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB', // gray-200
    marginBottom: 16,
  },
  commentForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  inputActions: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputActionButton: {
    padding: 4,
  },
  sendButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  commentsList: {
    paddingBottom: 8,
  },
  commentSeparator: {
    height: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937', // gray-800
  },
  moreButton: {
    padding: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#374151', // gray-700
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
    paddingLeft: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  likeText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  likedText: {
    color: '#8B5CF6', // mindcare-purple
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  viewMoreButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#8B5CF6', // mindcare-purple
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CommentSection;