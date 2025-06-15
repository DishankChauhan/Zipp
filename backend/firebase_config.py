import firebase_admin
from firebase_admin import credentials, auth, firestore
from config import settings
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.app = None
        self.db = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                # Initialize with service account credentials
                cred = credentials.Certificate(settings.firebase_credentials)
                self.app = firebase_admin.initialize_app(cred, {
                    'projectId': settings.FIREBASE_PROJECT_ID,
                })
                logger.info("Firebase Admin SDK initialized successfully")
            else:
                self.app = firebase_admin.get_app()
                logger.info("Using existing Firebase app instance")
            
            # Initialize Firestore
            self.db = firestore.client()
            logger.info("Firestore client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise e
    
    async def verify_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token and return user data"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture')
            }
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None
    
    async def get_user_by_uid(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user data from Firestore"""
        try:
            user_doc = self.db.collection('users').document(uid).get()
            if user_doc.exists:
                return user_doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get user by UID: {str(e)}")
            return None
    
    async def create_or_update_user(self, user_data: Dict[str, Any]) -> bool:
        """Create or update user in Firestore"""
        try:
            user_ref = self.db.collection('users').document(user_data['uid'])
            user_ref.set({
                'uid': user_data['uid'],
                'email': user_data['email'],
                'email_verified': user_data.get('email_verified', False),
                'name': user_data.get('name', ''),
                'picture': user_data.get('picture', ''),
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'deployments_count': 0,
                'active_deployments': 0
            }, merge=True)
            return True
        except Exception as e:
            logger.error(f"Failed to create/update user: {str(e)}")
            return False
    
    async def get_user_deployments(self, uid: str) -> list:
        """Get all deployments for a user"""
        try:
            deployments = self.db.collection('deployments')\
                               .where('user_id', '==', uid)\
                               .order_by('created_at', direction=firestore.Query.DESCENDING)\
                               .stream()
            
            result = []
            for deployment in deployments:
                deployment_data = deployment.to_dict()
                deployment_data['id'] = deployment.id
                result.append(deployment_data)
            
            return result
        except Exception as e:
            logger.error(f"Failed to get user deployments: {str(e)}")
            return []
    
    async def create_deployment(self, deployment_data: Dict[str, Any]) -> Optional[str]:
        """Create a new deployment record"""
        try:
            doc_ref = self.db.collection('deployments').add({
                **deployment_data,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            return doc_ref[1].id
        except Exception as e:
            logger.error(f"Failed to create deployment: {str(e)}")
            return None
    
    async def update_deployment(self, deployment_id: str, update_data: Dict[str, Any]) -> bool:
        """Update deployment record"""
        try:
            self.db.collection('deployments').document(deployment_id).update({
                **update_data,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            logger.error(f"Failed to update deployment: {str(e)}")
            return False

# Global Firebase service instance
firebase_service = FirebaseService() 