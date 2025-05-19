# core/middleware.py
import logging
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

User = get_user_model()
logger = logging.getLogger(__name__)


class UnifiedWebSocketAuthMiddleware(BaseMiddleware):
    """
    Unified WebSocket authentication middleware that supports both:
    1. JWT token authentication via query parameter or header
    2. Session-based authentication
    """

    async def __call__(self, scope, receive, send):
        try:
            logger.info("============= WebSocket Authentication Start =============")
            if scope["type"] != "websocket":
                return await super().__call__(scope, receive, send)

            # Log the query string for debugging
            query_string = scope.get("query_string", b"").decode()
            logger.info(f"Query string received: {query_string}")

            # Try token authentication first
            user = await self.authenticate_by_token(scope)
            if user:
                logger.info(
                    f"Successfully authenticated user via token: {user.username} (ID: {user.id})"
                )
            else:
                logger.warning(
                    "Token authentication failed, trying session authentication"
                )
                user = await self.authenticate_by_session(scope)

            scope["user"] = user
            if user and not user.is_anonymous:
                logger.info(
                    f"Authentication successful for user: {user.username} (ID: {user.id})"
                )
            else:
                logger.warning("User is anonymous or authentication failed")

            logger.info("============= WebSocket Authentication End =============")
            return await super().__call__(scope, receive, send)

        except Exception as e:
            logger.error(f"WebSocket authentication error: {str(e)}", exc_info=True)
            scope["user"] = AnonymousUser()
            return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def authenticate_by_token(self, scope):
        """Authenticate user by JWT token from query param or header"""
        try:
            # Try to get token from query string
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]
            logger.debug(f"Token from query string: {token and token[:10]}...")

            # If no token in query string, try to get from headers
            if not token and "headers" in scope:
                headers = dict(scope["headers"])
                auth_header = headers.get(b"authorization", b"").decode()
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    logger.debug(f"Token from header: {token and token[:10]}...")

            if not token:
                logger.warning("No token found in request")
                return None

            # Validate token
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            logger.debug(f"Token validated, user_id: {user_id}")

            user = User.objects.get(id=user_id)
            logger.info(f"User found: {user.username} (ID: {user_id})")
            return user

        except (TokenError, InvalidToken) as e:
            logger.warning(f"Invalid token: {str(e)}")
            return None
        except User.DoesNotExist as e:
            logger.warning(f"User not found: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Token authentication error: {str(e)}", exc_info=True)
            return None

    @database_sync_to_async
    def authenticate_by_session(self, scope):
        """Authenticate user by session"""
        try:
            if "session" not in scope:
                logger.debug("No session found in WebSocket scope")
                return AnonymousUser()

            session_key = scope["session"].get("_auth_user_id")
            if not session_key:
                logger.debug("No user ID found in session")
                return AnonymousUser()

            user = User.objects.get(id=session_key)
            logger.info(
                f"Successfully authenticated WebSocket user via session: {user.username}"
            )
            return user
        except User.DoesNotExist:
            logger.warning(f"Session user not found with ID: {session_key}")
            return AnonymousUser()
        except Exception as e:
            logger.error(f"Session authentication error: {str(e)}", exc_info=True)
            return AnonymousUser()
