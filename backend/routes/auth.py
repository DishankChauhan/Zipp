from fastapi import APIRouter, HTTPException, Depends, status
from models import TokenRequest, AuthResponse, UserResponse, APIResponse
from auth import auth_service, get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=AuthResponse)
async def login(token_request: TokenRequest):
    """
    Login or signup user with Firebase ID token.
    This endpoint handles both login and signup - if user doesn't exist, it creates them.
    """
    try:
        user = await auth_service.verify_and_create_user(token_request.id_token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        return AuthResponse(
            success=True,
            message="Authentication successful",
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return current_user

@router.post("/verify", response_model=APIResponse)
async def verify_token(token_request: TokenRequest):
    """
    Verify if a Firebase token is valid without creating/updating user.
    """
    try:
        user_data = await auth_service.firebase.verify_token(token_request.id_token)
        
        if not user_data:
            return APIResponse(
                success=False,
                message="Invalid token"
            )
        
        return APIResponse(
            success=True,
            message="Token is valid",
            data={
                "uid": user_data['uid'],
                "email": user_data['email'],
                "email_verified": user_data.get('email_verified', False)
            }
        )
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return APIResponse(
            success=False,
            message="Token verification failed"
        )

@router.delete("/logout", response_model=APIResponse)
async def logout(current_user: UserResponse = Depends(get_current_user)):
    """
    Logout endpoint (client-side token removal).
    Firebase tokens are stateless, so logout is handled client-side.
    """
    return APIResponse(
        success=True,
        message="Logout successful. Please remove the token from client-side storage."
    ) 