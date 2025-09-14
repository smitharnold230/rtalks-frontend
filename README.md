# R-Talks Frontend 🎪

> Modern, responsive frontend for the R-Talks event ticket booking platform. Optimized for Vercel deployment with seamless backend integration.

## ✨ Features

- 🎨 **Modern UI/UX** with Glassmorphism design
- 📱 **Fully Responsive** - works on all devices
- 🎫 **Multi-tier Ticket System** (Professional, Executive, Leadership)
- 💳 **Razorpay Payment Integration** (hosted payment page)
- 🎤 **Dynamic Speaker Profiles** with image galleries
- 📧 **Contact Form** with real-time validation
- 👨‍💼 **Admin Dashboard** for content management
- 🔒 **Secure Authentication** with JWT
- ⚡ **Performance Optimized** with caching and compression

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with glassmorphism effects
- **Vanilla JavaScript** - No frameworks, pure performance
- **Vercel** - Static hosting and CDN
- **RESTful API** - Seamless backend communication

## 🚀 Quick Deploy to Vercel

### Option 1: Direct Vercel CLI Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from this directory**
   ```bash
   cd rtalks-frontend
   vercel
   ```

3. **Follow the prompts**
   - Choose your account
   - Confirm project settings
   - Deploy!

### Option 2: Git Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/rtalks-frontend.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

## 📋 Pre-Deployment Setup

### 1. Update API Configuration

Edit `js/config.js` with your actual backend URLs:

```javascript
const CONFIG = {
    // Replace with your Render backend URL
    PRODUCTION_API_URL: 'https://your-backend-app.onrender.com/api',
    
    // For custom domain setup
    // Replace 'your-domain.com' with your actual domain
    // return `https://api.your-domain.com/api`;
};
```

### 2. Update Vercel Configuration

Edit `vercel.json` if using custom domain:

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

### 3. Backend CORS Configuration

Ensure your backend allows your frontend domain:

```env
# In your backend .env file
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

## 🔧 Local Development

### Simple HTTP Server
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

### Live Server (VS Code Extension)
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📁 Project Structure

```
rtalks-frontend/
├── 📄 index.html          # Main landing page
├── 📄 style.css           # Global styles
├── 📄 vercel.json         # Vercel deployment config
├── 📄 package.json        # Project metadata
├── 📁 admin/              # Admin dashboard
│   ├── 📄 index.html      # Admin dashboard
│   └── 📄 login.html      # Admin login
├── 📁 css/                # Stylesheets
│   ├── 📄 admin.css       # Admin-specific styles
│   └── 📄 style.css       # Additional styles
├── 📁 js/                 # JavaScript modules
│   ├── 📄 config.js       # API configuration
│   ├── 📄 main.js         # Main application logic
│   └── 📄 payment.js      # Payment handling
├── 📁 images/             # Static assets
│   ├── 🖼️ logos and branding
│   └── 🎥 promotional videos
└── 📁 uploads/            # User-uploaded content
    └── 🖼️ speaker images
```

## 🌐 API Integration

### Automatic Environment Detection

The frontend automatically detects the environment:

- **Development**: `localhost:3001/api`
- **Production**: Configured backend URL
- **Custom Domain**: `api.your-domain.com/api`

### API Endpoints Used

```javascript
// Public endpoints
GET  /api/packages          // Ticket packages
GET  /api/speakers          // Speaker profiles  
GET  /api/event             // Event details
POST /api/orders            // Create orders
POST /api/contact           // Contact form

// Admin endpoints (requires authentication)
GET  /api/admin/stats       // Dashboard analytics
GET  /api/admin/orders      // Order management
POST /api/admin/login       // Authentication
// ... more admin endpoints
```

## 🎨 UI Components

### Glassmorphism Design
- Transparent cards with backdrop blur
- Gradient backgrounds
- Smooth animations and transitions
- Modern typography with Inter font

### Responsive Layout
- Mobile-first design approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Flexible grid system
- Touch-friendly interactions

### Interactive Elements
- Hover effects and micro-animations
- Form validation feedback
- Loading states
- Success/error notifications

## 💳 Payment Flow

### Razorpay Hosted Payment Page
1. User selects ticket package
2. Fills out customer information
3. Frontend creates order via API
4. Redirects to Razorpay's secure payment page
5. User completes payment
6. Returns to frontend with payment status
7. Order status updated automatically

### Benefits
- ✅ **PCI Compliant** - Razorpay handles sensitive data
- ✅ **Mobile Optimized** - Works on all devices
- ✅ **Secure** - No payment data on frontend
- ✅ **Simple** - Minimal integration required

## 🔒 Security Features

### Frontend Security
- **XSS Protection** - Input sanitization
- **HTTPS Only** - Secure communications
- **CORS Configured** - Restricted API access
- **No Sensitive Data** - All secrets on backend

### Content Security Policy
Configured via Vercel headers for additional protection.

## 🚀 Performance Optimizations

### Caching Strategy
```json
{
  "Static Assets": "1 year cache",
  "HTML Files": "No cache (always fresh)",
  "API Calls": "No cache (real-time data)"
}
```

### Image Optimization
- Compressed images for web
- Multiple formats (PNG, JPG)
- Responsive image loading

### Code Optimization
- Minified CSS and JavaScript
- Efficient DOM manipulation
- Lazy loading where appropriate

## 🔍 Monitoring & Analytics

### Health Checks
The frontend includes built-in health checking:
- API connectivity verification
- Payment system status
- Real-time error reporting

### Performance Monitoring
- Page load times
- API response times
- User interaction tracking

## 🛠️ Development Guidelines

### Code Style
- Use semantic HTML5 elements
- BEM methodology for CSS classes
- ES6+ JavaScript features
- Consistent indentation (2 spaces)

### Browser Support
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color ratios
- Focus indicators

## 📱 Mobile Optimization

### Touch Interactions
- Minimum touch target size: 44px
- Swipe gestures for navigation
- Touch-friendly form controls

### Performance
- Optimized for mobile networks
- Progressive enhancement
- Offline functionality (basic)

## 🎯 Deployment Checklist

- [ ] Update `js/config.js` with production API URLs
- [ ] Update `vercel.json` with custom domain (if applicable)
- [ ] Verify backend CORS configuration
- [ ] Test payment integration
- [ ] Check admin panel functionality
- [ ] Validate responsive design
- [ ] Test all forms and interactions
- [ ] Verify SSL certificate
- [ ] Test performance on mobile

## 🔄 Continuous Deployment

### Automatic Deployment
Vercel automatically deploys when you push to your main branch:
1. Push code to GitHub
2. Vercel detects changes
3. Builds and deploys automatically
4. New version goes live

### Preview Deployments
Every pull request gets a preview URL for testing before merging.

## 📞 Support & Documentation

### Frontend Issues
- Check browser console for errors
- Verify API connectivity
- Check network requests in DevTools

### Common Issues
1. **API Connection Failed**: Check backend URL in config.js
2. **Payment Not Working**: Verify Razorpay configuration
3. **Admin Login Failed**: Check backend JWT configuration
4. **Images Not Loading**: Verify upload directory permissions

## 📄 License

MIT License - feel free to use this frontend for your own projects.

---

**🎉 Your R-Talks frontend is ready for Vercel deployment!**

Deploy URL: `vercel.com` → Import Git Repository → Deploy  
Live Demo: `https://your-app.vercel.app`  
Admin Panel: `https://your-app.vercel.app/admin`