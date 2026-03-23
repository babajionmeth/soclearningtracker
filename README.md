# SOC Tracker — Deployment Guide

SOC Analyst Learning Tracker — Track your cybersecurity training progress with friends.

## Quick Start (Local Dev)

```bash
# Clone and enter directory
cd /path/to/soc-tracker

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env — set JWT_SECRET to a random 32+ character string

# Seed test users (optional)
npm run seed
# Creates: rahul/test123, friend1/test123

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- **Backend:** Node.js + Express + better-sqlite3
- **Auth:** bcryptjs + JWT (7-day expiry)
- **Frontend:** Vanilla HTML/CSS/JS (no build step)
- **Database:** SQLite (file: `data.db`)

---

## VPS Deployment (Ubuntu + Nginx + PM2)

### 1. Prep the Server

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Deploy the App

```bash
# Clone to /var/www
sudo mkdir -p /var/www/soc-tracker
sudo chown $USER:$USER /var/www/soc-tracker

# Copy files (or git clone)
rsync -avz --exclude node_modules --exclude .env --exclude '*.db' ./ user@your-vps:/var/www/soc-tracker/

# On the VPS:
cd /var/www/soc-tracker
npm install --production

# Setup env
cp .env.example .env
nano .env
# Set JWT_SECRET=<random-32-char-string>

# Seed users (optional)
npm run seed
```

### 3. Start with PM2

```bash
cd /var/www/soc-tracker
pm2 start server/index.js --name soc-tracker
pm2 save
pm2 startup  # follow the printed command
```

### 4. Nginx Config

Create `/etc/nginx/sites-available/soc-tracker`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or VPS IP

    root /var/www/soc-tracker/public;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/soc-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## PM2 Commands

```bash
pm2 status            # check if running
pm2 logs soc-tracker  # view logs
pm2 restart soc-tracker
pm2 stop soc-tracker
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/register | No | Create account |
| POST | /api/login | No | Login, get JWT |
| GET | /api/roadmap | No | Full roadmap data |
| GET | /api/progress | Yes | User's progress |
| POST | /api/progress | Yes | Toggle task |
| GET | /api/streaks | Yes | Streak info |
| POST | /api/checkin | Yes | Daily check-in |
| GET | /api/leaderboard | No | All users ranked |
