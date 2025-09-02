# SCEAR Backend - Digital Ocean Deployment Guide

## 📋 Prerequisites

1. **Digital Ocean Account** s doménou
2. **GitHub repository** s backend kódom  
3. **Database** - PostgreSQL managed database na DO
4. **Cloudinary account** (už nakonfigurovaný)

## 🖥️ Step 1: Create Digital Ocean Droplet

1. Login to Digital Ocean
2. Create Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($12/month - 2GB RAM, 1 CPU)
   - **Region:** Frankfurt (nearest to Slovakia)
   - **Authentication:** SSH keys recommended
   - **Hostname:** scear-backend

## 💾 Step 2: Create PostgreSQL Database

1. In DO Console: **Databases → Create Database**
2. **Engine:** PostgreSQL 15
3. **Plan:** Basic ($15/month)
4. **Region:** Same as droplet (Frankfurt)
5. **Database name:** `scear_production`
6. **User:** `scear_admin`

## 🚀 Step 3: Deploy Backend

### Connect to droplet:
```bash
ssh root@your-droplet-ip
```

### Clone and setup:
```bash
# Clone repository
git clone https://github.com/your-username/scear-backend.git /var/www/scear-backend
cd /var/www/scear-backend

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Configure environment:
```bash
# Edit production environment
nano .env

# Update these values:
DATABASE_HOST=your-db-host
DATABASE_PORT=25060
DATABASE_NAME=scear_production
DATABASE_USERNAME=scear_admin
DATABASE_PASSWORD=your-db-password
```

### Start application:
```bash
# Build and start
npm run build
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save
```

## 🌐 Step 4: Configure Domain & SSL

### Update Nginx config:
```bash
sudo nano /etc/nginx/sites-available/scear-backend

# Replace 'your-domain.com' with actual domain
# Example: api.scear.sk
```

### Setup SSL:
```bash
sudo certbot --nginx -d api.scear.sk
```

## ⚙️ Step 5: Update Frontend

Update frontend `.env`:
```env
NEXT_PUBLIC_STRAPI_API_URL=https://api.scear.sk
```

## 🔧 Step 6: Configure Strapi

1. Visit `https://api.scear.sk/admin`
2. Create admin account
3. **Settings → Users & Permissions → Roles → Public**
4. Enable Activity permissions:
   - ✅ find
   - ✅ findOne  
   - ✅ create
   - ✅ update
   - ✅ delete

## ✅ Step 7: Test Deployment

### Test API endpoints:
```bash
# Test basic health
curl https://api.scear.sk/api/events

# Test activities (after permissions)
curl https://api.scear.sk/api/activities

# Test admin
curl https://api.scear.sk/admin
```

## 📊 Monitoring Commands

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs scear-backend

# Restart app
pm2 restart scear-backend

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check database connection
psql -h your-db-host -p 25060 -U scear_admin -d scear_production
```

## 🔄 Updates & Maintenance

```bash
# Update code
cd /var/www/scear-backend
git pull origin main
npm run build
pm2 restart scear-backend

# Database backup
pg_dump -h your-db-host -p 25060 -U scear_admin scear_production > backup.sql
```

## 🚨 Troubleshooting

### Common issues:

1. **Activities API 403:** Check permissions in Strapi admin
2. **Database connection:** Verify DATABASE_URL in .env
3. **CORS errors:** Check Nginx CORS headers
4. **Port issues:** Ensure port 1337 is available

### Useful logs:
```bash
# Application logs
pm2 logs scear-backend --lines 50

# Nginx logs  
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## 💰 Cost Estimate

- **Droplet (2GB):** $12/month
- **PostgreSQL DB:** $15/month  
- **Domain:** $10/year
- **Total:** ~$27/month

## 🎯 Expected Results

After successful deployment:

- ✅ Backend API: `https://api.scear.sk`
- ✅ Admin Panel: `https://api.scear.sk/admin`  
- ✅ Activities API working with proper permissions
- ✅ SSL certificate auto-renewal
- ✅ PM2 process management
- ✅ Automated backups (setup separately)

---

🚀 **Ready to deploy? Follow steps 1-7 and your SCEAR backend will be running on Digital Ocean!**