import docker
import os
import shutil
import uuid
import asyncio
import logging
from typing import Optional, Dict, Any, List, Tuple
from git import Repo
import zipfile
import tempfile
from pathlib import Path
from config import settings
from models import DeploymentStatus, DeploymentType
import json
import random

logger = logging.getLogger(__name__)

class DockerService:
    def __init__(self):
        self.client = docker.from_env()
        self.used_ports = set()
        self.ensure_directories()
        self.cleanup_orphaned_ports()
    
    def cleanup_orphaned_ports(self):
        """Clean up any orphaned port reservations on startup"""
        try:
            # Get all actually used ports by running containers
            used_ports = set()
            containers = self.client.containers.list(all=True)
            for container in containers:
                if container.ports:
                    for port_info in container.ports.values():
                        if port_info:
                            for port_mapping in port_info:
                                if 'HostPort' in port_mapping:
                                    used_ports.add(int(port_mapping['HostPort']))
            
            # Reset our internal tracking to match reality
            self.used_ports = used_ports.copy()
            logger.info(f"Cleaned up port tracking. Currently used ports: {self.used_ports}")
        except Exception as e:
            logger.warning(f"Could not cleanup orphaned ports: {e}")
            self.used_ports = set()  # Reset to empty if we can't determine
    
    def ensure_directories(self):
        """Ensure upload and clone directories exist"""
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        os.makedirs(settings.CLONE_DIR, exist_ok=True)
    
    def get_available_port(self) -> int:
        """Get an available port for deployment"""
        # Get all currently used ports by Docker containers
        used_ports = set()
        try:
            containers = self.client.containers.list(all=True)
            for container in containers:
                if container.ports:
                    for port_info in container.ports.values():
                        if port_info:
                            for port_mapping in port_info:
                                if 'HostPort' in port_mapping:
                                    used_ports.add(int(port_mapping['HostPort']))
        except Exception as e:
            logger.warning(f"Could not get Docker port info: {e}")
        
        logger.info(f"Docker used ports: {used_ports}")
        logger.info(f"Internally tracked ports: {self.used_ports}")
        
        # Find an available port
        for port in range(settings.DEPLOYMENT_PORT_RANGE_START, settings.DEPLOYMENT_PORT_RANGE_END):
            if port not in used_ports and port not in self.used_ports:
                # Double-check if port is actually free
                import socket
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    result = s.connect_ex(('localhost', port))
                    if result != 0:  # Port is free
                        logger.info(f"Selected port {port} for deployment")
                        self.used_ports.add(port)
                        return port
                    else:
                        logger.warning(f"Port {port} appears free in Docker but is actually in use")
        
        # If we get here, no ports are available
        logger.error(f"No available ports in range {settings.DEPLOYMENT_PORT_RANGE_START}-{settings.DEPLOYMENT_PORT_RANGE_END}")
        logger.error(f"Used ports: {used_ports}")
        logger.error(f"Tracked ports: {self.used_ports}")
        raise Exception("No available ports in the specified range")
    
    def release_port(self, port: int):
        """Release a port back to the available pool"""
        self.used_ports.discard(port)
    
    async def clone_repository(self, repo_url: str, branch: str = "main") -> Tuple[str, List[str]]:
        """Clone a Git repository and return the local path and logs"""
        logs = []
        try:
            # Generate unique directory name
            repo_id = str(uuid.uuid4())
            clone_path = os.path.join(settings.CLONE_DIR, repo_id)
            
            logs.append(f"Cloning repository: {repo_url}")
            logs.append(f"Requested branch: {branch}")
            logs.append(f"Target directory: {clone_path}")
            
            # Try to clone with the specified branch first
            try:
                repo = Repo.clone_from(repo_url, clone_path, branch=branch, depth=1)
                logs.append(f"Successfully cloned with branch: {branch}")
            except Exception as e:
                # If the specified branch doesn't exist, try common alternatives
                if "not found" in str(e).lower() or "does not exist" in str(e).lower():
                    logs.append(f"Branch '{branch}' not found, trying alternatives...")
                    
                    # Clean up failed attempt
                    if os.path.exists(clone_path):
                        shutil.rmtree(clone_path)
                    
                    # Try common branch names
                    alternative_branches = ["master", "main", "develop", "dev"]
                    if branch in alternative_branches:
                        alternative_branches.remove(branch)
                    else:
                        alternative_branches = ["master", "main", "develop", "dev"]
                    
                    cloned = False
                    for alt_branch in alternative_branches:
                        try:
                            logs.append(f"Trying branch: {alt_branch}")
                            repo = Repo.clone_from(repo_url, clone_path, branch=alt_branch, depth=1)
                            logs.append(f"Successfully cloned with branch: {alt_branch}")
                            cloned = True
                            break
                        except Exception as alt_e:
                            logs.append(f"Branch '{alt_branch}' also failed: {str(alt_e)}")
                            continue
                    
                    if not cloned:
                        # Last resort: clone without specifying branch (gets default)
                        try:
                            logs.append("Trying to clone default branch...")
                            repo = Repo.clone_from(repo_url, clone_path, depth=1)
                            logs.append("Successfully cloned default branch")
                        except Exception as final_e:
                            error_msg = f"Failed to clone repository with any branch: {str(final_e)}"
                            logs.append(error_msg)
                            raise Exception(error_msg)
                else:
                    # Different error, re-raise
                    raise e
            
            logs.append(f"Repository size: {self._get_directory_size(clone_path)} MB")
            
            # Get the actual branch name that was cloned
            try:
                actual_branch = repo.active_branch.name
                logs.append(f"Cloned branch: {actual_branch}")
            except:
                logs.append("Could not determine active branch name")
            
            return clone_path, logs
            
        except Exception as e:
            error_msg = f"Failed to clone repository: {str(e)}"
            logs.append(error_msg)
            logger.error(error_msg)
            
            # Clean up on failure
            if 'clone_path' in locals() and os.path.exists(clone_path):
                try:
                    shutil.rmtree(clone_path)
                except:
                    pass
            
            raise Exception(error_msg)
    
    async def extract_zip(self, zip_path: str) -> Tuple[str, List[str]]:
        """Extract a ZIP file and return the local path and logs"""
        logs = []
        try:
            # Generate unique directory name
            extract_id = str(uuid.uuid4())
            extract_path = os.path.join(settings.CLONE_DIR, extract_id)
            
            logs.append(f"Extracting ZIP file: {zip_path}")
            logs.append(f"Target directory: {extract_path}")
            
            # Extract the ZIP file
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            
            # If there's only one directory in the extracted content, use it as the root
            extracted_contents = os.listdir(extract_path)
            if len(extracted_contents) == 1 and os.path.isdir(os.path.join(extract_path, extracted_contents[0])):
                actual_path = os.path.join(extract_path, extracted_contents[0])
            else:
                actual_path = extract_path
            
            logs.append(f"Successfully extracted ZIP file")
            logs.append(f"Extracted size: {self._get_directory_size(actual_path)} MB")
            
            return actual_path, logs
            
        except Exception as e:
            error_msg = f"Failed to extract ZIP file: {str(e)}"
            logs.append(error_msg)
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def _get_directory_size(self, path: str) -> float:
        """Get directory size in MB"""
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(path):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                try:
                    total_size += os.path.getsize(filepath)
                except (OSError, IOError):
                    pass
        return round(total_size / (1024 * 1024), 2)
    
    def _detect_project_type(self, project_path: str) -> str:
        """Detect the type of project and return appropriate Dockerfile content"""
        # Check for common project files
        files = os.listdir(project_path)
        
        # Node.js projects
        if 'package.json' in files:
            with open(os.path.join(project_path, 'package.json'), 'r') as f:
                package_data = json.load(f)
                
            # Check if it's a Next.js project
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            all_deps = {**dependencies, **dev_dependencies}
            
            if 'next' in all_deps:
                return self._generate_nextjs_dockerfile()
            elif 'react-scripts' in all_deps:
                return self._generate_react_dockerfile()
            else:
                return self._generate_nodejs_dockerfile()
        
        # Python projects
        if 'requirements.txt' in files or 'setup.py' in files or 'pyproject.toml' in files:
            return self._generate_python_dockerfile()
        
        # Static HTML projects
        if any(f.endswith('.html') for f in files):
            return self._generate_static_dockerfile()
        
        # Default to Node.js if we can't determine the type
        return self._generate_nodejs_dockerfile()
    
    def _generate_nextjs_dockerfile(self) -> str:
        return """
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
"""
    
    def _generate_react_dockerfile(self) -> str:
        return """
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""
    
    def _generate_nodejs_dockerfile(self) -> str:
        return """
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
"""
    
    def _generate_python_dockerfile(self) -> str:
        return """
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
"""
    
    def _generate_static_dockerfile(self) -> str:
        return """
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""
    
    async def build_and_deploy(self, 
                              project_path: str, 
                              deployment_name: str,
                              user_id: str) -> Tuple[str, int, List[str]]:
        """Build Docker image and deploy container"""
        logs = []
        container_id = None
        port = None
        
        try:
            # Generate unique image name
            image_name = f"instantsite_{user_id}_{deployment_name}_{uuid.uuid4().hex[:8]}".lower()
            logs.append(f"Building Docker image: {image_name}")
            
            # Check if Dockerfile exists, if not create one
            dockerfile_path = os.path.join(project_path, 'Dockerfile')
            if not os.path.exists(dockerfile_path):
                logs.append("No Dockerfile found, generating one based on project type...")
                dockerfile_content = self._detect_project_type(project_path)
                with open(dockerfile_path, 'w') as f:
                    f.write(dockerfile_content)
                logs.append("Generated Dockerfile")
            
            # Build the Docker image
            logs.append("Starting Docker build...")
            try:
                image, build_logs = self.client.images.build(
                    path=project_path,
                    tag=image_name,
                    rm=True,
                    forcerm=True
                )
                
                # Process build logs
                for log in build_logs:
                    if 'stream' in log:
                        log_line = log['stream'].strip()
                        if log_line:
                            logs.append(f"BUILD: {log_line}")
                
                logs.append(f"Successfully built image: {image_name}")
                
            except docker.errors.BuildError as e:
                error_msg = f"Docker build failed: {str(e)}"
                logs.append(error_msg)
                raise Exception(error_msg)
            
            # Get available port
            port = self.get_available_port()
            logs.append(f"Assigned port: {port}")
            
            # Run the container
            logs.append("Starting container...")
            
            # Determine which internal port to map based on project type
            dockerfile_content = ""
            if os.path.exists(dockerfile_path):
                with open(dockerfile_path, 'r') as f:
                    dockerfile_content = f.read()
            
            # Determine internal port from Dockerfile
            internal_port = 80  # Default for nginx
            if 'EXPOSE 3000' in dockerfile_content:
                internal_port = 3000
            elif 'EXPOSE 8000' in dockerfile_content:
                internal_port = 8000
            
            logs.append(f"Mapping internal port {internal_port} to external port {port}")
            
            container = self.client.containers.run(
                image_name,
                ports={f'{internal_port}/tcp': port},
                detach=True,
                name=f"instantsite_{deployment_name}_{uuid.uuid4().hex[:8]}",
                remove=False,
                mem_limit="512m",
                cpu_period=100000,
                cpu_quota=50000  # 50% CPU limit
            )
            
            container_id = container.id
            logs.append(f"Container started: {container_id}")
            logs.append(f"Container name: {container.name}")
            
            # Wait a moment for the container to start
            await asyncio.sleep(2)
            
            # Check if container is running
            container.reload()
            if container.status != 'running':
                container_logs = container.logs().decode('utf-8')
                logs.append(f"Container failed to start. Logs: {container_logs}")
                raise Exception("Container failed to start")
            
            logs.append("Deployment successful!")
            return container_id, port, logs
            
        except Exception as e:
            # Cleanup on failure
            if container_id:
                try:
                    container = self.client.containers.get(container_id)
                    container.stop()
                    container.remove()
                except:
                    pass
            
            if port:
                self.release_port(port)
            
            error_msg = f"Deployment failed: {str(e)}"
            logs.append(error_msg)
            logger.error(error_msg)
            raise Exception(error_msg)
    
    async def stop_container(self, container_id: str) -> bool:
        """Stop a running container"""
        try:
            container = self.client.containers.get(container_id)
            container.stop()
            logger.info(f"Stopped container: {container_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to stop container {container_id}: {str(e)}")
            return False
    
    async def remove_container(self, container_id: str, port: int = None) -> bool:
        """Remove a container and clean up resources"""
        try:
            container = self.client.containers.get(container_id)
            container.stop()
            container.remove()
            
            if port:
                self.release_port(port)
            
            logger.info(f"Removed container: {container_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to remove container {container_id}: {str(e)}")
            return False
    
    async def get_container_logs(self, container_id: str) -> List[str]:
        """Get logs from a container"""
        try:
            container = self.client.containers.get(container_id)
            logs = container.logs().decode('utf-8').split('\n')
            return [log for log in logs if log.strip()]
        except Exception as e:
            logger.error(f"Failed to get container logs {container_id}: {str(e)}")
            return [f"Error getting logs: {str(e)}"]
    
    def cleanup_project_files(self, project_path: str):
        """Clean up project files after deployment"""
        try:
            if os.path.exists(project_path):
                shutil.rmtree(project_path)
                logger.info(f"Cleaned up project files: {project_path}")
        except Exception as e:
            logger.error(f"Failed to cleanup project files {project_path}: {str(e)}")

# Global Docker service instance
docker_service = DockerService() 