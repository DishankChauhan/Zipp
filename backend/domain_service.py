import os
import uuid
import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

class DomainService:
    def __init__(self):
        self.nginx_conf_dir = "/etc/nginx/conf.d"
        self.base_domain = settings.BASE_DOMAIN
        self.ssl_cert_path = "/etc/letsencrypt/live"
    
    def generate_subdomain(self, deployment_id: str) -> str:
        """Generate a unique subdomain for deployment"""
        # Use first 8 chars of deployment ID for subdomain
        subdomain = deployment_id[:8].lower()
        return f"{subdomain}.{self.base_domain}"
    
    def generate_public_url(self, deployment_id: str, use_ssl: bool = True) -> str:
        """Generate public URL for deployment"""
        if self.base_domain == "localhost":
            # Development mode - use port-based URLs
            return f"http://localhost"  # Will be updated with port
        
        subdomain = self.generate_subdomain(deployment_id)
        protocol = "https" if use_ssl else "http"
        return f"{protocol}://{subdomain}"
    
    def create_nginx_config(self, deployment_id: str, port: int) -> bool:
        """Create nginx configuration for deployment"""
        try:
            if self.base_domain == "localhost":
                # Skip nginx config creation in development
                return True
            
            subdomain = self.generate_subdomain(deployment_id)
            config_content = self._generate_nginx_config(subdomain, port)
            
            config_file = os.path.join(self.nginx_conf_dir, f"{deployment_id}.conf")
            
            with open(config_file, 'w') as f:
                f.write(config_content)
            
            # Reload nginx
            os.system("nginx -s reload")
            
            logger.info(f"Created nginx config for {subdomain}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create nginx config: {str(e)}")
            return False
    
    def remove_nginx_config(self, deployment_id: str) -> bool:
        """Remove nginx configuration for deployment"""
        try:
            if self.base_domain == "localhost":
                return True
            
            config_file = os.path.join(self.nginx_conf_dir, f"{deployment_id}.conf")
            
            if os.path.exists(config_file):
                os.remove(config_file)
                os.system("nginx -s reload")
                logger.info(f"Removed nginx config for deployment {deployment_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove nginx config: {str(e)}")
            return False
    
    def _generate_nginx_config(self, subdomain: str, port: int) -> str:
        """Generate nginx configuration content"""
        ssl_config = ""
        if os.path.exists(f"{self.ssl_cert_path}/{self.base_domain}"):
            ssl_config = f"""
    listen 443 ssl http2;
    ssl_certificate {self.ssl_cert_path}/{self.base_domain}/fullchain.pem;
    ssl_certificate_key {self.ssl_cert_path}/{self.base_domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {{
        return 301 https://$host$request_uri;
    }}"""
        else:
            ssl_config = "listen 80;"
        
        return f"""
server {{
{ssl_config}
    server_name {subdomain};
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    
    location / {{
        proxy_pass http://localhost:{port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }}
    
    # Health check
    location /health {{
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }}
}}
"""

# Global instance
domain_service = DomainService() 