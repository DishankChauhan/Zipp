from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form, BackgroundTasks
from models import (
    GitDeploymentRequest, 
    ZipDeploymentRequest,
    DeploymentResponse, 
    DeploymentListResponse,
    APIResponse,
    DeploymentStatus,
    DeploymentType,
    UserResponse
)
from auth import get_current_user
from firebase_config import firebase_service
from docker_service import docker_service
from config import settings
import logging
import os
import uuid
import asyncio
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/deployments", tags=["deployments"])

async def process_git_deployment(
    deployment_id: str,
    user_id: str,
    repo_url: str,
    branch: str,
    deployment_name: str
):
    """Background task to process Git deployment"""
    try:
        # Update status to cloning
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.CLONING.value,
            'build_logs': ['Starting Git clone process...']
        })
        
        # Clone repository
        project_path, clone_logs = await docker_service.clone_repository(repo_url, branch)
        
        # Update status to building
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.BUILDING.value,
            'build_logs': clone_logs + ['Starting Docker build...']
        })
        
        # Build and deploy
        container_id, port, build_logs = await docker_service.build_and_deploy(
            project_path, deployment_name, user_id
        )
        
        # Generate public URL
        public_url = f"http://{settings.BASE_DOMAIN}:{port}"
        
        # Update deployment with success
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.RUNNING.value,
            'container_id': container_id,
            'port': port,
            'public_url': public_url,
            'build_logs': clone_logs + build_logs
        })
        
        # Cleanup project files
        docker_service.cleanup_project_files(project_path)
        
        logger.info(f"Git deployment {deployment_id} completed successfully")
        
    except Exception as e:
        error_msg = f"Deployment failed: {str(e)}"
        logger.error(f"Git deployment {deployment_id} failed: {error_msg}")
        
        # Update deployment with failure
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.FAILED.value,
            'build_logs': [error_msg]
        })

async def process_zip_deployment(
    deployment_id: str,
    user_id: str,
    zip_path: str,
    deployment_name: str
):
    """Background task to process ZIP deployment"""
    try:
        # Update status to extracting
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.CLONING.value,
            'build_logs': ['Starting ZIP extraction...']
        })
        
        # Extract ZIP file
        project_path, extract_logs = await docker_service.extract_zip(zip_path)
        
        # Update status to building
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.BUILDING.value,
            'build_logs': extract_logs + ['Starting Docker build...']
        })
        
        # Build and deploy
        container_id, port, build_logs = await docker_service.build_and_deploy(
            project_path, deployment_name, user_id
        )
        
        # Generate public URL
        public_url = f"http://{settings.BASE_DOMAIN}:{port}"
        
        # Update deployment with success
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.RUNNING.value,
            'container_id': container_id,
            'port': port,
            'public_url': public_url,
            'build_logs': extract_logs + build_logs
        })
        
        # Cleanup files
        docker_service.cleanup_project_files(project_path)
        if os.path.exists(zip_path):
            os.remove(zip_path)
        
        logger.info(f"ZIP deployment {deployment_id} completed successfully")
        
    except Exception as e:
        error_msg = f"Deployment failed: {str(e)}"
        logger.error(f"ZIP deployment {deployment_id} failed: {error_msg}")
        
        # Update deployment with failure
        await firebase_service.update_deployment(deployment_id, {
            'status': DeploymentStatus.FAILED.value,
            'build_logs': [error_msg]
        })

@router.post("/git", response_model=APIResponse)
async def deploy_from_git(
    deployment_request: GitDeploymentRequest,
    background_tasks: BackgroundTasks,
    current_user: UserResponse = Depends(get_current_user)
):
    """Deploy a website from a Git repository"""
    try:
        # Generate deployment name if not provided
        deployment_name = deployment_request.name or f"git-deploy-{uuid.uuid4().hex[:8]}"
        
        # Create deployment record
        deployment_data = {
            'user_id': current_user.uid,
            'name': deployment_name,
            'description': deployment_request.description or '',
            'deployment_type': DeploymentType.GIT.value,
            'status': DeploymentStatus.PENDING.value,
            'repo_url': deployment_request.repo_url,
            'branch': deployment_request.branch,
            'build_logs': ['Deployment queued...']
        }
        
        deployment_id = await firebase_service.create_deployment(deployment_data)
        
        if not deployment_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create deployment record"
            )
        
        # Start background deployment process
        background_tasks.add_task(
            process_git_deployment,
            deployment_id,
            current_user.uid,
            deployment_request.repo_url,
            deployment_request.branch,
            deployment_name
        )
        
        return APIResponse(
            success=True,
            message="Git deployment started successfully",
            data={
                'deployment_id': deployment_id,
                'status': DeploymentStatus.PENDING.value
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Git deployment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start Git deployment"
        )

@router.post("/zip", response_model=APIResponse)
async def deploy_from_zip(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: UserResponse = Depends(get_current_user)
):
    """Deploy a website from a ZIP file"""
    try:
        # Validate file type
        if not file.filename.endswith('.zip'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only ZIP files are allowed"
            )
        
        # Generate deployment name if not provided
        deployment_name = name or f"zip-deploy-{uuid.uuid4().hex[:8]}"
        
        # Save uploaded file
        zip_filename = f"{uuid.uuid4().hex}_{file.filename}"
        zip_path = os.path.join(settings.UPLOAD_DIR, zip_filename)
        
        with open(zip_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create deployment record
        deployment_data = {
            'user_id': current_user.uid,
            'name': deployment_name,
            'description': description or '',
            'deployment_type': DeploymentType.ZIP.value,
            'status': DeploymentStatus.PENDING.value,
            'build_logs': ['ZIP file uploaded, deployment queued...']
        }
        
        deployment_id = await firebase_service.create_deployment(deployment_data)
        
        if not deployment_id:
            # Cleanup uploaded file on failure
            if os.path.exists(zip_path):
                os.remove(zip_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create deployment record"
            )
        
        # Start background deployment process
        background_tasks.add_task(
            process_zip_deployment,
            deployment_id,
            current_user.uid,
            zip_path,
            deployment_name
        )
        
        return APIResponse(
            success=True,
            message="ZIP deployment started successfully",
            data={
                'deployment_id': deployment_id,
                'status': DeploymentStatus.PENDING.value
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ZIP deployment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start ZIP deployment"
        )

@router.get("/", response_model=DeploymentListResponse)
async def get_user_deployments(current_user: UserResponse = Depends(get_current_user)):
    """Get all deployments for the current user"""
    try:
        deployments_data = await firebase_service.get_user_deployments(current_user.uid)
        
        deployments = []
        for deployment_data in deployments_data:
            # Handle datetime conversion
            deployment = DeploymentResponse(
                id=deployment_data['id'],
                user_id=deployment_data['user_id'],
                name=deployment_data['name'],
                description=deployment_data.get('description', ''),
                deployment_type=DeploymentType(deployment_data['deployment_type']),
                status=DeploymentStatus(deployment_data['status']),
                repo_url=deployment_data.get('repo_url'),
                branch=deployment_data.get('branch'),
                container_id=deployment_data.get('container_id'),
                port=deployment_data.get('port'),
                public_url=deployment_data.get('public_url'),
                build_logs=deployment_data.get('build_logs', []),
                created_at=deployment_data.get('created_at'),
                updated_at=deployment_data.get('updated_at')
            )
            deployments.append(deployment)
        
        return DeploymentListResponse(
            deployments=deployments,
            total=len(deployments)
        )
        
    except Exception as e:
        logger.error(f"Error getting user deployments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deployments"
        )

@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific deployment by ID"""
    try:
        # Get deployment data
        deployment_doc = firebase_service.db.collection('deployments').document(deployment_id).get()
        
        if not deployment_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
            )
        
        deployment_data = deployment_doc.to_dict()
        
        # Check if user owns this deployment
        if deployment_data['user_id'] != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        deployment = DeploymentResponse(
            id=deployment_id,
            user_id=deployment_data['user_id'],
            name=deployment_data['name'],
            description=deployment_data.get('description', ''),
            deployment_type=DeploymentType(deployment_data['deployment_type']),
            status=DeploymentStatus(deployment_data['status']),
            repo_url=deployment_data.get('repo_url'),
            branch=deployment_data.get('branch'),
            container_id=deployment_data.get('container_id'),
            port=deployment_data.get('port'),
            public_url=deployment_data.get('public_url'),
            build_logs=deployment_data.get('build_logs', []),
            created_at=deployment_data.get('created_at'),
            updated_at=deployment_data.get('updated_at')
        )
        
        return deployment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting deployment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deployment"
        )

@router.delete("/{deployment_id}", response_model=APIResponse)
async def delete_deployment(
    deployment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a deployment and stop its container"""
    try:
        # Get deployment data
        deployment_doc = firebase_service.db.collection('deployments').document(deployment_id).get()
        
        if not deployment_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
            )
        
        deployment_data = deployment_doc.to_dict()
        
        # Check if user owns this deployment
        if deployment_data['user_id'] != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Stop and remove container if it exists
        if deployment_data.get('container_id'):
            await docker_service.remove_container(
                deployment_data['container_id'], 
                deployment_data.get('port')
            )
        
        # Delete deployment record
        firebase_service.db.collection('deployments').document(deployment_id).delete()
        
        return APIResponse(
            success=True,
            message="Deployment deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting deployment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete deployment"
        )

@router.post("/{deployment_id}/stop", response_model=APIResponse)
async def stop_deployment(
    deployment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Stop a running deployment"""
    try:
        # Get deployment data
        deployment_doc = firebase_service.db.collection('deployments').document(deployment_id).get()
        
        if not deployment_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
            )
        
        deployment_data = deployment_doc.to_dict()
        
        # Check if user owns this deployment
        if deployment_data['user_id'] != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Stop container
        if deployment_data.get('container_id'):
            success = await docker_service.stop_container(deployment_data['container_id'])
            
            if success:
                # Update deployment status
                await firebase_service.update_deployment(deployment_id, {
                    'status': DeploymentStatus.STOPPED.value
                })
                
                return APIResponse(
                    success=True,
                    message="Deployment stopped successfully"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to stop container"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No container to stop"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping deployment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop deployment"
        ) 