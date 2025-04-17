import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import Avatar from './Avatar';
import { Button } from '../ui/Button';
import { Image as ImageIcon, Send, Smile, X, Camera, Video, Paperclip } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { getShadowStyles } from '../../styles/global';

const CreatePostCard = () => {
  const [postContent, setPostContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!postContent.trim() && !selectedImage) return;
    
    // In a real app, we would send this to an API
    toast({
      title: "Post created!",
      description: "Your post has been shared with the community.",
    });
    
    // Reset form
    setPostContent('');
    setIsExpanded(false);
    setSelectedImage(null);
  };
  
  const handleAddImage = () => {
    // Simulate choosing an image
    setSelectedImage('https://via.placeholder.com/300');
    toast({
      title: "Image added",
      description: "Your image has been attached to the post.",
    });
  };
  
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={[styles.container, getShadowStyles(2)]}>
      <View style={styles.innerContainer}>
        {/* Post Input Area */}
        <View style={styles.inputContainer}>
          <Avatar src="https://via.placeholder.com/100" alt="You" border />
          
          {!isExpanded ? (
            <TouchableOpacity 
              style={styles.collapsedInput}
              onPress={() => setIsExpanded(true)}
            >
              <Text style={styles.collapsedInputText}>What's on your mind?</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.expandedInputContainer}>
              <TextInput
                value={postContent}
                onChangeText={setPostContent}
                placeholder="Share your thoughts or experience..."
                style={styles.expandedInput}
                multiline
                autoFocus
              />
            </View>
          )}
        </View>
        
        {isExpanded && (
          <>
            {/* Selected Image Preview */}
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imagePreview}>
                  <Image 
                    source={{ uri: selectedImage }} 
                    style={styles.previewImage} 
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={handleRemoveImage}
                  >
                    <X width={20} height={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton} onPress={handleAddImage}>
                  <ImageIcon width={20} height={20} color="#10B981" />
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => toast({ title: "Video", description: "Video upload functionality would open here" })}
                >
                  <Video width={20} height={20} color="#3B82F6" />
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => toast({ title: "Attachment", description: "File upload functionality would open here" })}
                >
                  <Paperclip width={20} height={20} color="#F59E0B" />
                  <Text style={styles.mediaButtonText}>Files</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.submitButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsExpanded(false);
                    setPostContent('');
                    setSelectedImage(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.postButton, 
                    (!postContent.trim() && !selectedImage) && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={!postContent.trim() && !selectedImage}
                >
                  <Send width={16} height={16} color="#fff" />
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  innerContainer: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  collapsedInput: {
    flex: 1,
    backgroundColor: '#F3F4F6', // gray-100
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginLeft: 8,
  },
  collapsedInputText: {
    color: '#6B7280', // gray-500
  },
  expandedInputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  expandedInput: {
    backgroundColor: '#F9FAFB', // gray-50
    minHeight: 100,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB', // gray-50
    padding: 8,
    borderRadius: 8,
  },
  imagePreview: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB', // gray-200
    marginVertical: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mediaButtonText: {
    marginLeft: 4,
    color: '#6B7280', // gray-500
    fontSize: 14,
  },
  submitButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#6B7280', // gray-500
  },
  postButton: {
    backgroundColor: '#8B5CF6', // mindcare-purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  }
});

export default CreatePostCard;
