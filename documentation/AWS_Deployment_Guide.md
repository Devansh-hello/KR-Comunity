# AWS EC2 Deployment Guide for KRCommunity

## Prerequisites
- AWS Account with EC2 access
- Domain name (optional)
- SSH client
- Basic knowledge of Linux commands

## Step 1: Launch an EC2 Instance

1. **Choose an Instance Type**:
   - Go to AWS Console → EC2 → Launch Instance
   - Select Ubuntu Server 22.04 LTS
   - Choose t2.micro (free tier) or t2.small for better performance
   - Configure security group to allow:
     - SSH (port 22)
     - HTTP (port 80)
     - HTTPS (port 443)
     - Custom TCP (port 5432) for PostgreSQL

2. **Create Key Pair**:
   - Create a new key pair
   - Download the .pem file
   - Save it securely

## Step 2: Set Up the Server

1. **Connect to EC2**:
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Update System**:
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Install Required Software**:
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

4. **Configure PostgreSQL**:
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE krcommunity;
CREATE USER kruser WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE krcommunity TO kruser;
\q
```

## Step 3: Deploy the Application

1. **Clone the Repository**:
```bash
cd /var/www
sudo git clone your-repository-url krcommunity
cd krcommunity
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Set Up Environment Variables**:
```bash
# Create .env file
nano .env
```

Add the following variables:
```env
DATABASE_URL="postgresql://kruser:your-secure-password@localhost:5432/krcommunity"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Build the Application**:
```bash
npm run build
```

5. **Start the Application**:
```bash
pm2 start npm --name "krcommunity" -- start
pm2 save
pm2 startup
```

## Step 4: Configure Nginx

1. **Create Nginx Configuration**:
```bash
sudo nano /etc/nginx/sites-available/krcommunity
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Enable the Site**:
```bash
sudo ln -s /etc/nginx/sites-available/krcommunity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: Set Up SSL with Let's Encrypt

1. **Install Certbot**:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. **Get SSL Certificate**:
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 6: Database Migration

1. **Run Prisma Migrations**:
```bash
npx prisma migrate deploy
```

2. **Generate Prisma Client**:
```bash
npx prisma generate
```

## Step 7: Backup and Monitoring

1. **Set Up Database Backups**:
```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

Add the following:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U kruser krcommunity > "$BACKUP_DIR/krcommunity_$DATE.sql"
find $BACKUP_DIR -type f -mtime +7 -delete
```

2. **Make Script Executable**:
```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

3. **Add to Crontab**:
```bash
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-db.sh
```

## Step 8: Monitoring Setup

1. **Install Monitoring Tools**:
```bash
# Install Prometheus Node Exporter
sudo apt install -y prometheus-node-exporter

# Install CloudWatch Agent
sudo apt install -y amazon-cloudwatch-agent
```

2. **Configure CloudWatch**:
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

## Maintenance Commands

```bash
# Restart application
pm2 restart krcommunity

# View logs
pm2 logs krcommunity

# Check application status
pm2 status

# Database backup
/usr/local/bin/backup-db.sh

# Update application
cd /var/www/krcommunity
git pull
npm install
npm run build
pm2 restart krcommunity
```

## Security Considerations

1. **Regular Updates**:
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Firewall Configuration**:
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

3. **Database Security**:
- Change default PostgreSQL port
- Use strong passwords
- Regular backups
- Limited database user privileges

## Troubleshooting

1. **Check Application Logs**:
```bash
pm2 logs krcommunity
```

2. **Check Nginx Logs**:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

3. **Check Database Logs**:
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

4. **Common Issues**:
- Port conflicts: Check if ports are in use
- Database connection issues: Verify credentials and network
- SSL certificate issues: Check Certbot logs
- Memory issues: Monitor system resources

## Scaling Considerations

1. **Vertical Scaling**:
- Upgrade EC2 instance type
- Add more RAM/CPU

2. **Horizontal Scaling**:
- Set up load balancer
- Deploy multiple instances
- Use RDS for database

3. **Caching**:
- Implement Redis for session storage
- Use CDN for static assets

## Cost Optimization

1. **EC2 Instance**:
- Use reserved instances for long-term
- Implement auto-scaling
- Choose appropriate instance type

2. **Database**:
- Regular cleanup of old data
- Optimize queries
- Use appropriate storage type

3. **Monitoring**:
- Set up billing alerts
- Monitor resource usage
- Implement cost-saving measures 