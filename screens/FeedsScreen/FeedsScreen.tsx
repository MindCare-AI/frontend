import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { mockPosts } from '../../constants/mockFeeds';
import PostCard from './components/PostCard';
import CreatePostCard from './components/CreatePostCard';
import { Bell, Search, Filter, User, Plus } from 'lucide-react';
import { getShadowStyles } from '../../styles/global';

const FeedsScreen = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>MindCare AI</Text>
      
      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.iconButton}>
          <Filter width={20} height={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationBadge} />
          <Bell width={20} height={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <User width={20} height={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Search width={20} height={20} color="#999" />
      <Text style={styles.searchPlaceholder}>Search posts, topics, or users...</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.contentContainer}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={[styles.loadingCard, getShadowStyles(2)]}>
              <View style={styles.loadingHeader}>
                <View style={styles.loadingAvatar} />
                <View style={styles.loadingTextContainer}>
                  <View style={[styles.loadingText, { width: '40%' }]} />
                  <View style={[styles.loadingText, { width: '20%', height: 8 }]} />
                </View>
              </View>
              <View style={[styles.loadingText, { width: '75%' }]} />
              <View style={[styles.loadingText, { width: '100%' }]} />
              <View style={[styles.loadingText, { width: '60%' }]} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={mockPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {renderSearchBar()}
            <CreatePostCard />
          </>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      <TouchableOpacity style={[styles.fab, getShadowStyles(4)]}>
        <Plus width={24} height={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...getShadowStyles(2),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6', // mindcare-purple
  },
  headerControls: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // red-500
    zIndex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  separator: {
    height: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#9CA3AF', // gray-400
    fontSize: 14,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  loadingHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  loadingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  loadingTextContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6', // mindcare-purple
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedsScreen;
