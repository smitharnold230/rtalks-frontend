# 🚀 R-Talks Frontend Deployment Guide

## 🎯 Quick Deployment to Vercel

### Method 1: Vercel CLI (Fastest)

1. **Install Vercel CLI globally**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**
   ```bash
   cd rtalks-frontend
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Follow the interactive prompts**
   - Login to your Vercel account
   - Confirm project name: `rtalks-frontend`
   - Confirm deployment settings
   - Deploy!

### Method 2: Git + Vercel Dashboard

1. **Initialize Git repository**
   ```bash
   cd rtalks-frontend
   git init
   git add .
   git commit -m "Initial frontend deployment"
   ```

2. **Create GitHub repository**
   - Go to [GitHub](https://github.com/new)
   - Create repository: `rtalks-frontend`
   - Don't initialize with README (we already have files)

3. **Push to GitHub**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/rtalks-frontend.git
   git push -u origin main
   ```

4. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings (should auto-detect)
   - Deploy!

## ⚙️ Pre-Deployment Configuration

### 1. Update API Configuration

**Edit `js/config.js`:**
```javascript
const CONFIG = {
    // Replace with your actual Render backend URL
    PRODUCTION_API_URL: 'https://rtalks-backend-abc123.onrender.com/api',
    
    // Your development URL (updated to port 3001)
    DEVELOPMENT_API_URL: 'http://localhost:3001/api',
    
    getApiUrl: function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.DEVELOPMENT_API_URL;
        }
        
        // For custom domain setup
        const currentDomain = window.location.hostname;
        if (currentDomain && !currentDomain.includes('vercel.app')) {
            return `https://api.your-domain.com/api`;
        }
        
        return this.PRODUCTION_API_URL;
    }
};
```

### 2. Update Vercel Configuration (Optional)

**Edit `vercel.json` for custom domain:**
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.your-domain.com/api/$1"
    }
  ]
}
```

### 3. Backend CORS Update

**Make sure your backend allows your frontend domain:**

In your backend `.env`:
```env
ALLOWED_ORIGINS=https://rtalks-frontend.vercel.app,https://your-domain.com
```

## 🌐 Custom Domain Setup (Optional)

### Step 1: Add Domain to Vercel

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Domains"
3. Add your domain: `your-domain.com`
4. Add www subdomain: `www.your-domain.com`

### Step 2: Configure DNS (Hostinger)

1. **Login to Hostinger**
2. **Go to DNS Zone Editor**
3. **Add/Update records:**

```
Type    Name    Value                           TTL
A       @       76.76.19.61                     3600
A       www     76.76.19.61                     3600
CNAME   api     your-backend-app.onrender.com   3600
```

### Step 3: Wait for Propagation

DNS changes can take 24-48 hours to fully propagate worldwide.

## 🔧 Deployment Settings

### Vercel Project Settings

```json
{
  "name": "rtalks-frontend",
  "framework": null,
  "buildCommand": null,
  "outputDirectory": null,
  "installCommand": null,
  "devCommand": null
}
```

### Environment Variables (Optional)

Add these in Vercel dashboard if needed:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

## ✅ Post-Deployment Checklist

### 1. Test Frontend Functionality
- [ ] Homepage loads correctly
- [ ] All images and assets load
- [ ] Navigation works properly
- [ ] Forms are functional
- [ ] Responsive design works on mobile

### 2. Test Backend Integration
- [ ] API calls work from production frontend
- [ ] Event data loads correctly
- [ ] Ticket packages display properly
- [ ] Speaker profiles load with images
- [ ] Contact form submissions work

### 3. Test Payment Flow
- [ ] Ticket selection works
- [ ] Order creation succeeds
- [ ] Razorpay payment page loads
- [ ] Payment redirect works correctly
- [ ] Order status updates properly

### 4. Test Admin Panel
- [ ] Admin login page accessible at `/admin`
- [ ] Login with credentials works
- [ ] Dashboard loads with data
- [ ] All admin functions work
- [ ] Logout functionality works

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Failed**
```
Error: Failed to fetch from API
```
**Solution**: Check `js/config.js` - ensure backend URL is correct

**2. CORS Error**
```
Access to fetch blocked by CORS policy
```
**Solution**: Update backend CORS settings to include your Vercel URL

**3. Payment Integration Issues**
```
Razorpay payment page not loading
```
**Solution**: Verify backend Razorpay configuration and payment URLs

**4. Images Not Loading**
```
404 errors for speaker images
```
**Solution**: Ensure backend serves static files correctly

**5. Admin Panel Access Denied**
```
401 Unauthorized
```
**Solution**: Check JWT configuration in backend

### Debug Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Verify API Endpoints**
   ```bash
   # Test backend health
   curl https://your-backend.onrender.com/api/health
   
   # Test API from frontend
   curl https://your-frontend.vercel.app/api/packages
   ```

3. **Check Vercel Logs**
   - Go to Vercel dashboard
   - Select your project
   - Check "Functions" → "Logs"

## 📊 Performance Optimization

### Vercel Analytics

Enable analytics in your Vercel dashboard:
1. Go to project settings
2. Enable "Analytics"
3. Monitor performance metrics

### Lighthouse Scores

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Caching Strategy

Current cache headers:
```
Static assets (CSS/JS/Images): 1 year
HTML files: No cache (always fresh)
```

## 🔄 Continuous Deployment

### Automatic Deployment

Once connected to GitHub:
1. Push code to `main` branch
2. Vercel automatically detects changes
3. Builds and deploys new version
4. Live site updates within minutes

### Preview Deployments

- Every pull request gets a unique preview URL
- Test changes before merging to main
- Share preview links with team members

### Branch Deployments

Set up branch-specific deployments:
- `main` → Production
- `staging` → Staging environment
- `dev` → Development preview

## 📈 Monitoring & Maintenance

### Health Monitoring

The frontend includes health checking:
- API connectivity status
- Payment system availability
- Real-time error reporting

### Regular Updates

Monthly maintenance tasks:
- Check for broken links
- Update dependencies
- Review performance metrics
- Test all functionality
- Update content as needed

### Backup Strategy

Your code is safe with:
- Git version control
- GitHub repository backup
- Vercel automatic deployments
- Easy rollback to previous versions

---

## 🎉 Deployment Complete!

Your R-Talks frontend is now live on Vercel!

**Live URLs:**
- Production: `https://rtalks-frontend.vercel.app`
- Admin Panel: `https://rtalks-frontend.vercel.app/admin`
- Custom Domain: `https://your-domain.com` (if configured)

**Next Steps:**
1. Share the live URL with your team
2. Test all functionality thoroughly
3. Monitor performance and errors
4. Plan content updates and feature releases

**Support:**
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- GitHub Issues: Create issues in your repository
- Community Support: Vercel Discord

---

**🚀 Your R-Talks platform is now live and ready for users!**