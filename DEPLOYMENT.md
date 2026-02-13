# Deployment Guide: School Assessment & CSR Management System

**Domain:** `app.browncirrcle.com`
**Hosting:** GCP e2-micro VM (Always Free tier)
**Estimated monthly cost:** ~INR 0-500

---

## What You're Building

```
  Internet (Users)
       |
       | https://app.browncirrcle.com
       v
 +-----------+
 |   Nginx   |  <-- Handles SSL (HTTPS) + routes traffic
 |  (port 80 |
 |  & 443)   |
 +-----+-----+
       |
       +---> /api/*  --> Express Backend (port 5000)
       |
       +---> /*      --> Next.js Frontend (port 3000)

 +-------------+
 | PostgreSQL  |  <-- Database (local on same VM)
 | (port 5432) |
 +-------------+

 +-------------------+
 | GCP Cloud Storage |  <-- Visit photos (separate GCP service)
 +-------------------+
```

Everything runs on ONE single VM. Nginx sits in front and directs:
- Requests to `/api/...` go to your Express backend
- All other requests go to your Next.js frontend

---

## Prerequisites (Before You Start)

You need these ready:

1. **A Google account** (Gmail works fine)
2. **A GCP account** with billing enabled
   - Go to https://console.cloud.google.com
   - New accounts get $300 free credits for 90 days
   - Even after that, e2-micro is Always Free
3. **Your domain** `app.browncirrcle.com` - you need access to DNS settings at your domain registrar
4. **Your code pushed to GitHub** (already done - `brown-cirrcle-school-data`)

---

## STEP 1: Create a GCP Project

> **What is a GCP Project?** It's like a folder that holds all your cloud resources (VMs, storage, etc.)

1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top-left (next to "Google Cloud")
3. Click **"New Project"**
4. Enter:
   - **Project name:** `school-assessment`
   - **Organization:** Leave as default
5. Click **"Create"**
6. Make sure this project is selected in the dropdown

### Enable Required APIs

These are GCP services your app will use. In the GCP Console:

1. Go to the hamburger menu (top-left) > **APIs & Services** > **Library**
2. Search and enable each of these (click on each, then click "Enable"):
   - **Compute Engine API** (for the VM)
   - **Cloud Storage API** (for photo uploads)

---

## STEP 2: Create the VM (Your Server)

> **What is a VM?** A virtual machine - it's like having a computer in Google's data center that you can connect to remotely.

### 2.1 Create the VM Instance

1. Go to hamburger menu > **Compute Engine** > **VM Instances**
   - If this is your first time, it will take a minute to initialize
2. Click **"Create Instance"**
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `school-app-vm` |
| **Region** | `asia-south1 (Mumbai)` |
| **Zone** | `asia-south1-a` |
| **Machine type** | `e2-micro` (2 vCPU, 1 GB memory) |

4. Under **Boot disk**, click **"Change"**:
   - **Operating system:** Ubuntu
   - **Version:** Ubuntu 22.04 LTS
   - **Size:** 30 GB
   - Click **"Select"**

5. Under **Firewall**:
   - Check **"Allow HTTP traffic"**
   - Check **"Allow HTTPS traffic"**

6. Click **"Create"**

Wait 1-2 minutes for the VM to start. You'll see a green checkmark when it's ready.

### 2.2 Reserve a Static IP Address

> **Why?** Without this, your VM's IP address changes every time it restarts, and your domain would stop working.

1. Go to hamburger menu > **VPC Network** > **IP addresses**
2. Find your VM's IP in the list (it will say "Ephemeral")
3. Click **"Reserve"** next to it
4. Give it a name: `school-app-ip`
5. Click **"Reserve"**

**Write down this IP address** (e.g., `34.131.xx.xx`). You'll need it for DNS setup.

---

## STEP 3: Point Your Domain to the VM

> **What does this do?** When someone types `app.browncirrcle.com` in their browser, this tells the internet to send them to your VM's IP address.

Go to your **domain registrar** (wherever you bought `browncirrcle.com` - GoDaddy, Namecheap, Google Domains, Hostinger, etc.)

1. Find **DNS Settings** or **DNS Management**
2. Add this record:

| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| **A** | `app` | `34.131.xx.xx` (your VM's static IP) | 600 |

3. Save the record

> **Note:** DNS takes 5-30 minutes to propagate. You can check if it's working by running `ping app.browncirrcle.com` from your computer's terminal - it should show your VM's IP.

---

## STEP 4: Connect to Your VM (SSH)

> **What is SSH?** It's a way to open a terminal/command line on your remote VM, as if you were sitting in front of it.

### Option A: From GCP Console (Easiest)
1. Go to **Compute Engine** > **VM Instances**
2. Click the **"SSH"** button next to your VM
3. A browser window will open with a terminal

### Option B: From your Windows terminal
```bash
# Install Google Cloud CLI first: https://cloud.google.com/sdk/docs/install
gcloud compute ssh school-app-vm --zone=asia-south1-a
```

You should now see a terminal prompt like:
```
username@school-app-vm:~$
```

**Everything from STEP 5 onwards is typed into this VM terminal.**

---

## STEP 5: Install All Required Software

Copy and paste these commands one section at a time.

### 5.1 Update the system
```bash
sudo apt update && sudo apt upgrade -y
```
> This updates all pre-installed software to the latest versions. Takes 1-2 minutes.

### 5.2 Install Node.js 20 (JavaScript runtime)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify it installed correctly:
```bash
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

### 5.3 Install PostgreSQL (database)
```bash
sudo apt install -y postgresql postgresql-contrib
```

Verify:
```bash
sudo systemctl status postgresql
# Should show: active (running)
```

### 5.4 Install Nginx (reverse proxy)
```bash
sudo apt install -y nginx
```

### 5.5 Install Certbot (for free SSL certificates)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.6 Install PM2 (keeps your app running)
```bash
sudo npm install -g pm2
```

> **What is PM2?** It's a process manager that keeps your Node.js apps running 24/7, restarts them if they crash, and starts them on reboot.

### 5.7 Install build tools
```bash
sudo apt install -y build-essential git
```

---

## STEP 6: Add Swap Memory (CRITICAL for e2-micro)

> **Why?** Your VM only has 1 GB RAM. Building Next.js needs more than that. Swap uses disk space as extra memory - it's slower but prevents crashes.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Make it permanent (survives reboot):
```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Verify:
```bash
free -m
# You should see ~2048 under Swap total
```

---

## STEP 7: Set Up the Database

### 7.1 Create database and user

```bash
sudo -u postgres psql
```

You're now inside the PostgreSQL prompt (it shows `postgres=#`). Type these commands:

```sql
CREATE DATABASE school_assessment;
CREATE USER school_user WITH PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE school_assessment TO school_user;
ALTER DATABASE school_assessment OWNER TO school_user;
\q
```

> **IMPORTANT:** Replace `YourStrongPassword123!` with your own strong password. **Remember this password** - you'll need it in Step 9.

### 7.2 Test the connection

```bash
psql -U school_user -d school_assessment -h localhost -W
# Enter your password when prompted
# If you see "school_assessment=>" prompt, it works!
# Type \q to exit
```

---

## STEP 8: Set Up GCP Cloud Storage (for photos)

> **What is this?** A place to store the photos that employees upload during school visits. It's separate from the VM so photos aren't lost if something happens to the VM.

### 8.1 Create a storage bucket

Back in the **GCP Console** (browser), or from the VM terminal:

```bash
# Install gsutil (part of gcloud CLI) if not already available
# On GCP VMs, it's usually pre-installed

# Create the bucket (name must be globally unique)
gsutil mb -l asia-south1 gs://browncirrcle-school-photos/
```

> If the name is taken, try something like `gs://browncirrcle-school-photos-2026/`

### 8.2 Create a service account (gives your app permission to upload photos)

```bash
# Create the service account
gcloud iam service-accounts create school-storage-sa \
  --display-name="School App Storage Access"

# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Give it permission to manage files in the bucket
gsutil iam ch serviceAccount:school-storage-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectAdmin \
  gs://browncirrcle-school-photos/

# Create a key file (this is like a password for the service account)
gcloud iam service-accounts keys create ~/gcp-storage-key.json \
  --iam-account=school-storage-sa@${PROJECT_ID}.iam.gserviceaccount.com
```

### 8.3 Store the key file securely

```bash
sudo mkdir -p /opt/credentials
sudo mv ~/gcp-storage-key.json /opt/credentials/
sudo chmod 600 /opt/credentials/gcp-storage-key.json
```

### 8.4 Make the bucket publicly readable (so users can view uploaded photos)

```bash
gsutil iam ch allUsers:objectViewer gs://browncirrcle-school-photos/
```

---

## STEP 9: Deploy Your Application

### 9.1 Clone the repository

```bash
sudo mkdir -p /opt/app
sudo chown $USER:$USER /opt/app
cd /opt/app

git clone https://github.com/KedarG63/brown-cirrcle-school-data.git .
```

> This downloads your code. The `.` at the end means "put it in the current directory" instead of creating a subfolder.

### 9.2 Set up the Backend

```bash
cd /opt/app/backend
npm install
```

Now create the environment file:

```bash
nano .env
```

> **What is nano?** A simple text editor in the terminal. You type text, then press `Ctrl+O` to save and `Ctrl+X` to exit.

Paste this content (edit the values marked with `<...>`):

```env
NODE_ENV=production
PORT=5000

# Database - use the password you set in Step 7
DATABASE_URL="postgresql://school_user:YourStrongPassword123!@localhost:5432/school_assessment"

# JWT Secrets - generate random strings (run: openssl rand -hex 32)
JWT_SECRET=<paste-random-string-here>
JWT_REFRESH_SECRET=<paste-different-random-string-here>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# GCP Cloud Storage
GCP_PROJECT_ID=school-assessment
GCP_BUCKET_NAME=browncirrcle-school-photos
GCP_SERVICE_ACCOUNT_PATH=/opt/credentials/gcp-storage-key.json

# Frontend URL (your domain)
FRONTEND_URL=https://app.browncirrcle.com
```

**To generate the JWT secrets**, open a second terminal (or run these before opening nano):
```bash
openssl rand -hex 32
# Copy the output and use it for JWT_SECRET

openssl rand -hex 32
# Copy the output and use it for JWT_REFRESH_SECRET
```

Save the file (`Ctrl+O`, Enter, `Ctrl+X`).

### 9.3 Build the backend and set up the database

```bash
cd /opt/app/backend

# Compile TypeScript to JavaScript
npm run build

# Create the database tables
npx prisma migrate deploy

# Add the default admin and employee accounts
npx prisma db seed
```

> After seeding, you'll see login credentials printed. **Write these down** - you'll need them to log into your app!
> Default: `admin@schoolassessment.com` / `Admin@123`

Test the backend:
```bash
node dist/app.js
# You should see: "Server running on port 5000 in production mode"
# Press Ctrl+C to stop it
```

### 9.4 Set up the Frontend

```bash
cd /opt/app/frontend
npm install
```

Create the environment file:
```bash
nano .env.local
```

Paste:
```env
NEXT_PUBLIC_API_URL=https://app.browncirrcle.com/api
```

Save (`Ctrl+O`, Enter, `Ctrl+X`).

Build the frontend:
```bash
npm run build
```

> This will take 2-5 minutes on e2-micro (because of limited RAM). The swap memory from Step 6 prevents it from crashing. Be patient.

Test:
```bash
npx next start -p 3000
# You should see: "Ready on http://localhost:3000"
# Press Ctrl+C to stop
```

---

## STEP 10: Start Your App with PM2

> **Why PM2?** If you just run `node app.js`, the app stops when you close the terminal. PM2 keeps it running forever, restarts it if it crashes, and starts it on reboot.

### 10.1 Create the PM2 config file

```bash
nano /opt/app/ecosystem.config.js
```

Paste:
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '/opt/app/backend',
      script: 'dist/app.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      max_memory_restart: '400M'
    },
    {
      name: 'frontend',
      cwd: '/opt/app/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '400M'
    }
  ]
};
```

Save (`Ctrl+O`, Enter, `Ctrl+X`).

### 10.2 Start both apps

```bash
cd /opt/app
pm2 start ecosystem.config.js
```

Check they're running:
```bash
pm2 status
```

You should see:
```
┌────┬──────────┬──────┬──────┬────────┬─────────┬────────┐
│ id │ name     │ mode │ pid  │ status │ restart │ cpu    │
├────┼──────────┼──────┼──────┼────────┼─────────┼────────┤
│ 0  │ backend  │ fork │ 1234 │ online │ 0       │ 0%     │
│ 1  │ frontend │ fork │ 1235 │ online │ 0       │ 0%     │
└────┴──────────┴──────┴──────┴────────┴─────────┴────────┘
```

Both should show **"online"**. If one shows "errored", check logs:
```bash
pm2 logs backend --lines 20
pm2 logs frontend --lines 20
```

### 10.3 Make PM2 start on reboot

```bash
pm2 save
pm2 startup systemd
```

PM2 will print a command starting with `sudo env PATH=...`. **Copy and run that exact command.**

---

## STEP 11: Configure Nginx (Reverse Proxy)

> **What does Nginx do here?** It sits in front of your two apps and routes traffic:
> - `app.browncirrcle.com/api/...` goes to the backend (port 5000)
> - `app.browncirrcle.com/anything-else` goes to the frontend (port 3000)
> - It also handles SSL (HTTPS)

### 11.1 Create the Nginx config

```bash
sudo nano /etc/nginx/sites-available/school-assessment
```

Paste this entire block:

```nginx
server {
    listen 80;
    server_name app.browncirrcle.com;

    # Max upload size (for photo uploads)
    client_max_body_size 50M;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (Next.js)
    location / {
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

    # Gzip compression (makes pages load faster)
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json application/xml;
}
```

Save (`Ctrl+O`, Enter, `Ctrl+X`).

### 11.2 Enable the site

```bash
# Create a link to enable the site
sudo ln -s /etc/nginx/sites-available/school-assessment /etc/nginx/sites-enabled/

# Remove the default Nginx page
sudo rm /etc/nginx/sites-enabled/default

# Test the config for syntax errors
sudo nginx -t
# Should show: "syntax is ok" and "test is successful"

# Restart Nginx
sudo systemctl restart nginx
```

### 11.3 Quick test (HTTP only, before SSL)

Open a browser and go to: `http://app.browncirrcle.com`

- If DNS has propagated, you should see your app (or at least a response)
- If it doesn't work yet, try using the VM's IP directly: `http://34.131.xx.xx`

---

## STEP 12: Enable HTTPS (SSL Certificate)

> **Why HTTPS?** Without it, all data (including passwords) is sent in plain text. Browsers also show "Not Secure" warnings. Let's Encrypt gives you free SSL certificates.

```bash
sudo certbot --nginx -d app.browncirrcle.com
```

It will ask you:
1. **Enter email address:** Type your email (for renewal notifications)
2. **Agree to terms:** Type `Y`
3. **Share email with EFF:** Type `N` (optional)
4. **Redirect HTTP to HTTPS:** Choose option `2` (Redirect) - **this is recommended**

Certbot will automatically edit your Nginx config to add SSL.

### Verify SSL works

Open: `https://app.browncirrcle.com`

You should see a padlock icon in the browser address bar.

### Test auto-renewal

SSL certificates expire every 90 days, but Certbot auto-renews them. Verify:

```bash
sudo certbot renew --dry-run
# Should show: "Congratulations, all simulated renewals succeeded"
```

---

## STEP 13: Secure the VM

### 13.1 Verify firewall rules

In GCP Console > **VPC Network** > **Firewall rules**, make sure only these ports are open:

| Port | Purpose |
|------|---------|
| 22 | SSH (remote access) |
| 80 | HTTP (redirects to HTTPS) |
| 443 | HTTPS (your app) |

**DO NOT** open ports 3000 or 5000 - they should only be accessible internally through Nginx.

### 13.2 Keep system updated

```bash
sudo apt update && sudo apt upgrade -y
```

Run this periodically (once a month) or set up automatic updates:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

---

## STEP 14: Set Up Database Backups

> **Why?** If something goes wrong, you don't want to lose all your school visit data.

### 14.1 Create backup script

```bash
sudo mkdir -p /opt/backups
sudo chown $USER:$USER /opt/backups

nano /opt/app/backup-db.sh
```

Paste:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
BACKUP_FILE="${BACKUP_DIR}/db-${DATE}.sql.gz"

# Create backup and compress
pg_dump -U school_user -h localhost school_assessment | gzip > "$BACKUP_FILE"

# Delete backups older than 7 days
find "$BACKUP_DIR" -name "db-*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Save and make it executable:

```bash
chmod +x /opt/app/backup-db.sh
```

### 14.2 Add a password file (so the backup script doesn't ask for password)

```bash
nano ~/.pgpass
```

Paste (use your actual password):
```
localhost:5432:school_assessment:school_user:YourStrongPassword123!
```

Save, then set permissions:
```bash
chmod 600 ~/.pgpass
```

### 14.3 Test the backup

```bash
/opt/app/backup-db.sh
ls -la /opt/backups/
# You should see a .sql.gz file
```

### 14.4 Schedule automatic daily backups

```bash
crontab -e
# If asked which editor, choose nano (option 1)
```

Add this line at the bottom:
```
0 2 * * * /opt/app/backup-db.sh >> /var/log/db-backup.log 2>&1
```

> This runs the backup every day at 2:00 AM.

Save (`Ctrl+O`, Enter, `Ctrl+X`).

---

## STEP 15: Test Everything

Run through this checklist:

| Test | How to check | Expected result |
|------|-------------|-----------------|
| **App loads** | Visit `https://app.browncirrcle.com` | See login page |
| **SSL works** | Check for padlock in browser | Padlock shows |
| **API works** | Visit `https://app.browncirrcle.com/api/health` | `{"success":true,"message":"Server is running",...}` |
| **Login works** | Log in with `admin@schoolassessment.com` / `Admin@123` | Dashboard loads |
| **Photo upload** | Create a visit and upload a photo | Photo displays correctly |
| **PM2 running** | `pm2 status` on VM | Both apps "online" |
| **Reboot test** | `sudo reboot` then check app after 2 min | App comes back up |

---

## How to Update Your App (After Making Code Changes)

When you push new code to GitHub, SSH into your VM and run:

```bash
cd /opt/app

# Pull the latest code
git pull origin main

# Update backend
cd /opt/app/backend
npm install
npm run build
npx prisma migrate deploy

# Update frontend
cd /opt/app/frontend
npm install
npm run build

# Restart both apps
pm2 restart all
```

---

## Troubleshooting

### App shows "502 Bad Gateway"
Your backend or frontend isn't running:
```bash
pm2 status        # Check if apps are online
pm2 logs backend  # Check for errors
pm2 logs frontend
```

### "ERR_NAME_NOT_RESOLVED" in browser
DNS hasn't propagated yet. Wait 30 minutes, or check:
```bash
# From your local computer (not the VM)
nslookup app.browncirrcle.com
# Should show your VM's IP
```

### Next.js build runs out of memory
Swap might not be set up. Check:
```bash
free -m
# If Swap shows 0, redo Step 6
```

### Database connection errors
```bash
sudo systemctl status postgresql   # Is PostgreSQL running?
psql -U school_user -d school_assessment -h localhost -W   # Can you connect?
```

### Photo uploads fail
```bash
# Check if Cloud Storage credentials work
pm2 logs backend --lines 50   # Look for GCS errors

# Verify the service account key exists
ls -la /opt/credentials/gcp-storage-key.json
```

### Checking Nginx errors
```bash
sudo tail -20 /var/log/nginx/error.log
```

### Restarting individual services
```bash
pm2 restart backend    # Restart just the backend
pm2 restart frontend   # Restart just the frontend
sudo systemctl restart nginx       # Restart Nginx
sudo systemctl restart postgresql  # Restart database
```

---

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| e2-micro VM | **FREE** (Always Free tier) |
| 30 GB disk | **FREE** (Always Free tier) |
| Static IP (while attached to running VM) | **FREE** |
| Cloud Storage (first 5 GB) | **FREE** |
| SSL Certificate (Let's Encrypt) | **FREE** |
| Domain (varies by registrar) | ~INR 100-800/year |
| **Total** | **~INR 0-500/month** |
