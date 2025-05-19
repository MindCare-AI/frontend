# chatbot/serializers.py
from rest_framework import serializers
from .models import ChatbotConversation, ChatMessage, ConversationSummary


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField(read_only=True)
    chatbot_method = serializers.SerializerMethodField(read_only=True)  # New field

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "content",
            "sender",
            "sender_name",
            "is_bot",
            "timestamp",
            "message_type",
            "metadata",
            "parent_message",
            "chatbot_method",  # Include new field in the response
        ]
        read_only_fields = ["id", "timestamp", "sender_name", "chatbot_method"]

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.username
        return None

    def get_chatbot_method(self, obj):
        if obj.is_bot:
            # If the metadata contains a therapy recommendation from the RAG,
            # return its 'approach'. Otherwise, fallback to a default.
            rec = obj.metadata.get("therapy_recommendation") if obj.metadata else None
            if rec and rec.get("approach"):
                return rec.get("approach")
            return "Not determined"
        return None


class ConversationSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationSummary
        fields = [
            "id",
            "conversation",
            "created_at",
            "summary_text",
            "key_points",
            "emotional_context",
            "message_count",
        ]
        read_only_fields = ["id", "created_at"]


class ChatbotConversationSerializer(serializers.ModelSerializer):
    recent_messages = ChatMessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    latest_summary = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    metadata = serializers.HiddenField(default=dict)  # Hide metadata from browsable API
    participants = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = ChatbotConversation
        fields = [
            "id",
            "user",
            "title",
            "created_at",
            "last_activity",
            "is_active",
            "metadata",  # Still included in the API response but hidden in browsable API
            "last_message",
            "message_count",
            "latest_summary",
            "recent_messages",
            "last_message_at",
            "participants",
        ]
        read_only_fields = ["id", "created_at", "last_activity"]

    def get_last_message(self, obj):
        last_message = obj.messages.order_by("-timestamp").first()
        if last_message:
            return ChatMessageSerializer(last_message).data
        return None

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_latest_summary(self, obj):
        latest_summary = obj.summaries.order_by("-created_at").first()
        if latest_summary:
            return ConversationSummarySerializer(latest_summary).data
        return None

    def get_last_message_at(self, obj):
        last_message = obj.messages.order_by("-timestamp").first()
        if last_message:
            return last_message.timestamp
        return obj.created_at
