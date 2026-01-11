# ToDoUI Deployment Guide

## 🚀 Quick Deployment

### Option 1: Render.com (Recommended)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm run preview`
5. Add environment variables:
   - `VITE_API_BASE_URL=https://todoapi-tcbd.onrender.com`

### Option 2: Vercel (Recommended for React)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Set environment variable: `VITE_API_BASE_URL=https://todoapi-tcbd.onrender.com`

### Option 3: Docker Deployment
1. Build the image:
   ```bash
   docker build -t todoui:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 80:80 todoui:latest
   ```

## 🔧 Environment Variables

### Production (.env.production)
```env
VITE_API_BASE_URL=https://todoapi-tcbd.onrender.com
VITE_API_TIMEOUT=10000
VITE_APP_NAME=ToDoUI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

## 🌐 Deployment Platforms

### Render.com
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`
- **Publish Directory**: `dist`

### Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

## 🔒 Security Configuration

The application includes:
- Content Security Policy headers
- XSS protection
- Frame options
- HTTPS enforcement

## 📊 Performance Optimization

- Gzip compression enabled
- Static asset caching
- Code splitting
- Tree shaking

## 🏥 Health Check

Access `/health` endpoint to verify deployment status.

## 🐛 Troubleshooting

### Common Issues:
1. **API Connection Failed**: Check `VITE_API_BASE_URL` environment variable
2. **Build Fails**: Ensure all dependencies are installed
3. **CORS Errors**: Verify backend allows your frontend domain

### Debug Mode:
Set `VITE_ENABLE_DEBUG=true` in development for detailed logging.

## 📱 Mobile Optimization

The application is fully responsive and optimized for mobile devices with:
- Touch-friendly interface
- Progressive Web App support
- Offline capabilities

## 🔄 CI/CD Pipeline

Example GitHub Actions workflow:
```yaml
name: Deploy ToDoUI
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy
        run: # Your deployment command
```
