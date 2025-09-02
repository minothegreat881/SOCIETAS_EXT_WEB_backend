#!/bin/bash

# Digital Ocean Deployment Script for SCEAR Backend
# Run this script on the Digital Ocean droplet

set -e

echo "🚀 Starting SCEAR Backend deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL client (if needed)
sudo apt install -y postgresql-client

# Create application directory
sudo mkdir -p /var/www/scear-backend
sudo chown -R $USER:$USER /var/www/scear-backend

# Clone repository (or upload files)
cd /var/www/scear-backend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Copy production environment
cp .env.production .env

# Create logs directory
mkdir -p logs

# Build the application
echo "🔨 Building application..."
npm run build

# Setup PM2 startup
sudo pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

# Start application with PM2
echo "▶️ Starting application..."
pm2 start ecosystem.config.js

# Install and configure Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/scear-backend > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/scear-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install and configure SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com

echo "✅ Deployment completed!"
echo "🌐 Backend should be running at http://your-domain.com"
echo "👤 Admin panel: http://your-domain.com/admin"
echo ""
echo "Next steps:"
echo "1. Update DNS records to point to this server"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Update frontend .env with new backend URL"
echo "4. Test Activities API permissions"