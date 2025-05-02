# Docker Deployment Guide for SQLite Editor WebApp

This guide provides instructions on how to deploy the SQLite Editor WebApp using Docker.

## Prerequisites

- Docker (version 20.10.0 or later)
- Docker Compose (version 2.0.0 or later)
- A server with SSH access

## Deployment Steps

### 1. Clone the repository

```bash
git clone <repository-url>
cd sqlite-editor-webapp
```

### 2. Build and start the Docker containers

```bash
docker-compose up -d
```

This command builds the Docker image and starts the container in detached mode.

### 3. Verify the deployment

Access the application at `http://your-server-ip:3000`.

## Configuration Options

### Changing the port

If you want to use a different port, modify the `docker-compose.yml` file:

```yaml
ports:
  - "8080:3000"  # Change 8080 to your desired port
```

### Using a reverse proxy

For production, it's recommended to use a reverse proxy like Nginx:

1. Create an Nginx configuration file:

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

2. Save this as `/etc/nginx/sites-available/sqlite-editor.conf`
3. Enable the site: `ln -s /etc/nginx/sites-available/sqlite-editor.conf /etc/nginx/sites-enabled/`
4. Test the configuration: `nginx -t`
5. Reload Nginx: `systemctl reload nginx`

## Maintenance

### Viewing logs

```bash
docker-compose logs -f
```

### Updating the application

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Backing up data

The temporary SQLite files are stored in a Docker volume. To backup this volume:

```bash
docker run --rm -v sqlite-editor-webapp_sqlite-tmp:/source -v $(pwd)/backup:/backup alpine tar -czf /backup/sqlite-tmp-backup.tar.gz -C /source .
```

## Troubleshooting

### Container fails to start

Check the logs for errors:

```bash
docker-compose logs
```

### TypeScript and ESLint errors during build

The application is configured in `next.config.ts` to ignore TypeScript and ESLint errors during build. This allows the application to build and run even if there are type errors or linting issues.

If you want to fix the actual TypeScript errors in your codebase:

1. Run type checking locally with:
   ```bash
   npm run tsc
   ```

2. Fix the reported TypeScript errors in your code.

3. Common TypeScript errors and their fixes:
   - For route handler parameter issues:
     ```typescript
     // Change from:
     export async function GET(req: NextRequest, { params }: { params: { tableName: string } }) {
       // ...
     }
     
     // To:
     export async function GET(req: NextRequest, context: { params: { tableName: string } }) {
       const { tableName } = context.params;
       // ...
     }
     ```

### Application is not accessible

Verify that the port is open:

```bash
curl -I http://localhost:3000
```

Check if Docker container is running:

```bash
docker-compose ps
``` 