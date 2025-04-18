import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Message } from '../types/chat';
import chatWebSocket from './websocket';

interface QueuedMessage {
  id: string;
  message: Partial<Message>;
  timestamp: number;
  retryCount: number;
}

class MessageQueue {
  private static instance: MessageQueue;
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private queueKey = '@message_queue';

  private constructor() {
    this.initialize();
    this.setupNetworkListener();
  }

  static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue();
    }
    return MessageQueue.instance;
  }

  private async initialize() {
    try {
      const savedQueue = await AsyncStorage.getItem(this.queueKey);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        this.processQueue();
      }
    } catch (error) {
      console.error('Error initializing message queue:', error);
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  async enqueue(message: Partial<Message>) {
    const queuedMessage: QueuedMessage = {
      id: Math.random().toString(36).substring(7),
      message,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedMessage);
    await this.saveQueue();
    this.processQueue();

    return queuedMessage.id;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const networkState = await NetInfo.fetch();

    while (this.queue.length > 0 && networkState.isConnected) {
      const queuedMessage = this.queue[0];

      try {
        await this.sendMessage(queuedMessage);
        this.queue.shift(); // Remove the successfully sent message
        await this.saveQueue();
      } catch (error) {
        if (queuedMessage.retryCount >= this.maxRetries) {
          // Message failed permanently
          this.queue.shift();
          this.emitMessageFailed(queuedMessage);
        } else {
          // Increment retry count and move to the end of the queue
          queuedMessage.retryCount++;
          this.queue.push(this.queue.shift()!);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
        await this.saveQueue();
      }
    }

    this.isProcessing = false;
  }

  private async sendMessage(queuedMessage: QueuedMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chatWebSocket.sendMessage(queuedMessage.message);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.queueKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving message queue:', error);
    }
  }

  private emitMessageFailed(queuedMessage: QueuedMessage) {
    // Emit event or callback for permanently failed messages
    console.error('Message failed permanently:', queuedMessage);
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
  }

  getMessage(id: string): QueuedMessage | undefined {
    return this.queue.find(msg => msg.id === id);
  }
}

export default MessageQueue.getInstance();