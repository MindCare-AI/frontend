"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, TextInput, StyleSheet, TouchableOpacity, Keyboard, Platform, KeyboardAvoidingView } from "react-native"
import { Feather } from "@expo/vector-icons"
import type { Message } from "../../../types/messaging/index"

interface ChatInputProps {
  conversationId: string
  onSendMessage: (message: Message) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({ conversationId, onSendMessage }) => {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleSend = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: "current-user",
      senderName: "You",
      content: message.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
      read: false,
    }

    onSendMessage(newMessage)
    setMessage("")
    Keyboard.dismiss()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop recording
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="paperclip" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />
        </View>

        {message.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendButton, isRecording && styles.recordingButton]}
            onPress={toggleRecording}
          >
            <Feather name="mic" size={24} color={isRecording ? "white" : "white"} />
          </TouchableOpacity>
        )}
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording voice message...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

import { Text } from "react-native"

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  iconButton: {
    padding: 8,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 0,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    backgroundColor: "#EF4444",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "white",
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: "#666",
  },
})
