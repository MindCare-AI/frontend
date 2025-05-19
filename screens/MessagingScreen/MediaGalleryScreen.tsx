"use client"

import type React from "react"
import { useState } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Image } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { useMessagesStore } from "../../store/messagesStore"
import type { MediaGalleryScreenRouteProp, MediaGalleryScreenNavigationProp } from "../../navigation/types"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const MediaGalleryScreen: React.FC = () => {
  const route = useRoute<MediaGalleryScreenRouteProp>()
  const navigation = useNavigation<MediaGalleryScreenNavigationProp>()
  const { id: conversationId } = route.params

  const { conversations } = useMessagesStore()
  const conversation = conversations.find((c) => c.id === conversationId)

  const [activeTab, setActiveTab] = useState("photos")
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const photoItems: any[] = [] // TODO: Fetch from backend or store
  const documentItems: any[] = [] // TODO: Fetch from backend or store
  const linkItems: any[] = [] // TODO: Fetch from backend or store

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedItems([])
  }

  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const renderPhotoItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.includes(item.id)

    return (
      <TouchableOpacity style={styles.photoItem} onPress={() => selectionMode && toggleItemSelection(item.id)}>
        <Image source={{ uri: item.url }} style={styles.photoImage} />
        {selectionMode && (
          <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
            {isSelected && <Feather name="check" size={16} color="white" />}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderDocumentItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.includes(item.id)

    return (
      <TouchableOpacity style={styles.documentItem} onPress={() => selectionMode && toggleItemSelection(item.id)}>
        <View style={styles.documentIcon}>
          <Text style={styles.documentType}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{item.name}</Text>
          <Text style={styles.documentDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
        {selectionMode ? (
          <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
            {isSelected && <Feather name="check" size={16} color="white" />}
          </View>
        ) : (
          <TouchableOpacity style={styles.downloadButton}>
            <Feather name="download" size={20} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  const renderLinkItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.includes(item.id)

    return (
      <TouchableOpacity style={styles.linkItem} onPress={() => selectionMode && toggleItemSelection(item.id)}>
        <View style={styles.linkContent}>
          <Text style={styles.linkTitle}>{item.title}</Text>
          <Text style={styles.linkUrl}>{item.url}</Text>
          <Text style={styles.linkDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
        {selectionMode && (
          <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
            {isSelected && <Feather name="check" size={16} color="white" />}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          {selectionMode ? (
            <>
              <TouchableOpacity style={styles.backButton} onPress={toggleSelectionMode}>
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>{selectedItems.length} Selected</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="share" size={22} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="download" size={22} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="trash-2" size={22} color="#E11D48" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>Media & Files</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="search" size={22} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleSelectionMode}>
                  <Text style={styles.selectText}>Select</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "photos" && styles.activeTab]}
            onPress={() => setActiveTab("photos")}
          >
            <Text style={[styles.tabText, activeTab === "photos" && styles.activeTabText]}>Photos & Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "documents" && styles.activeTab]}
            onPress={() => setActiveTab("documents")}
          >
            <Text style={[styles.tabText, activeTab === "documents" && styles.activeTabText]}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "links" && styles.activeTab]}
            onPress={() => setActiveTab("links")}
          >
            <Text style={[styles.tabText, activeTab === "links" && styles.activeTabText]}>Links</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === "photos" && (
            <FlatList
              data={photoItems}
              renderItem={renderPhotoItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.photoGrid}
            />
          )}

          {activeTab === "documents" && (
            <FlatList
              data={documentItems}
              renderItem={renderDocumentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.documentList}
            />
          )}

          {activeTab === "links" && (
            <FlatList
              data={linkItems}
              renderItem={renderLinkItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.linkList}
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  selectText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  photoGrid: {
    padding: 4,
  },
  photoItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  documentList: {
    padding: 16,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  documentType: {
    fontSize: 12,
    fontWeight: "bold",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "500",
  },
  documentDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  downloadButton: {
    padding: 8,
  },
  linkList: {
    padding: 16,
  },
  linkItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 12,
    position: "relative",
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3B82F6",
  },
  linkUrl: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  linkDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  selectionIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIndicator: {
    backgroundColor: "#3B82F6",
    borderColor: "white",
  },
})

export default MediaGalleryScreen
