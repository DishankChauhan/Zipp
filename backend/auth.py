from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_config import firebase_service
from models import UserResponse
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

class AuthService:
    def __init__(self):
        self.firebase = firebase_service
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
        """
        Get current authenticated user from Firebase token.
        This is used as a dependency in protected routes.
        """
        try:
            # Verify the Firebase ID token
            user_data = await self.firebase.verify_token(credentials.credentials)
            
            if not user_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Get or create user in Firestore
            existing_user = await self.firebase.get_user_by_uid(user_data['uid'])
            
            if not existing_user:
                # Create new user in Firestore
                await self.firebase.create_or_update_user(user_data)
                existing_user = await self.firebase.get_user_by_uid(user_data['uid'])
            
            if not existing_user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve user data"
                )
            
            return UserResponse(**existing_user)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def verify_and_create_user(self, id_token: str) -> Optional[UserResponse]:
        """
        Verify Firebase token and create/update user in Firestore.
        Used for login/signup endpoint.
        """
        try:
            # Verify the Firebase ID token
            user_data = await self.firebase.verify_token(id_token)
            
            if not user_data:
                return None
            
            # Create or update user in Firestore
            success = await self.firebase.create_or_update_user(user_data)
            
            if not success:
                logger.error("Failed to create/update user in Firestore")
                return None
            
            # Get the updated user data
            updated_user = await self.firebase.get_user_by_uid(user_data['uid'])
            
            if updated_user:
                return UserResponse(**updated_user)
            
            return None
            
        except Exception as e:
            logger.error(f"Error in verify_and_create_user: {str(e)}")
            return None

    async def get_optional_current_user(self, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[UserResponse]:
        """
        Get current user if authenticated, otherwise return None.
        Used for optional authentication routes.
        """
        if not credentials:
            return None
        
        try:
            return await self.get_current_user(credentials)
        except HTTPException:
            return None

# Global auth service instance
auth_service = AuthService()

# Dependency functions for FastAPI
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """Dependency to get current authenticated user"""
    return await auth_service.get_current_user(credentials)

async def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[UserResponse]:
    """Dependency to optionally get current authenticated user"""
    return await auth_service.get_optional_current_user(credentials) 