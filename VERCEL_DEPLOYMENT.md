# 🚀 Vercel Deployment Guide

## API URL Configuration Explained

### 🔧 **Why Empty API URL for Production?**

When both frontend and backend are deployed on the same Vercel domain:

```javascript
// ✅ Production (same domain)
REACT_APP_API_URL = ""  // Uses relative paths like /api/health

// ❌ Wrong for production
REACT_APP_API_URL = "http://localhost:5000"  // Only works locally
```

### 🌐 **How API URLs Work:**

| Environment | REACT_APP_API_URL | Actual API Calls |
|-------------|-------------------|------------------|
| **Local Dev** | `http://localhost:5000` | `http://localhost:5000/api/health` |
| **Vercel Prod** | `""` (empty) | `https://your-app.vercel.app/api/health` |
| **External API** | `https://api.example.com` | `https://api.example.com/api/health` |

## 📋 **Deployment Options:**

### **Option 1: Full-Stack on Vercel (Same Domain)**
```bash
# Use vercel-fullstack.json config
cp vercel-fullstack.json vercel.json
vercel --prod
```

**Result:** 
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/*`
- API URL: Empty (`""`)

### **Option 2: Frontend Only on Vercel**
```bash
# Use default vercel.json (frontend only)
cd frontend
vercel --prod
```

**Result:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: Run separately (Railway, Render, etc.)
- API URL: `https://your-backend.railway.app`

### **Option 3: Separate Deployments**
```bash
# Frontend on Vercel
cd frontend
vercel --prod

# Backend on Railway/Render
# Set REACT_APP_API_URL to backend domain
```

## ⚙️ **Environment Variables Setup:**

### **For Vercel Dashboard:**
1. Go to your project settings
2. Add environment variables:

```
# For same-domain deployment
REACT_APP_API_URL = (leave empty)

# For external backend
REACT_APP_API_URL = https://your-backend-domain.com
```

### **For Local Development:**
```bash
# frontend/.env.local
REACT_APP_API_URL=http://localhost:5000
```

## 🔧 **Current Smart Configuration:**

The API service now automatically detects the environment:

```javascript
// Automatically chooses the right URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
```

**This means:**
- ✅ Local development: Uses `localhost:5000`
- ✅ Vercel production: Uses same domain (empty string)
- ✅ External API: Uses environment variable

## 🚀 **Quick Deploy Commands:**

```bash
# 1. Deploy everything to Vercel (same domain)
cp vercel-fullstack.json vercel.json
vercel --prod

# 2. Deploy frontend only to Vercel
cd frontend
vercel --prod
# Then set REACT_APP_API_URL in Vercel dashboard to your backend URL

# 3. Local development
python backend.py              # Terminal 1: Backend on :5000
cd frontend && npm start       # Terminal 2: Frontend on :3000
```

## ⚠️ **Common Issues:**

1. **CORS Errors:** Make sure backend allows your frontend domain
2. **API Not Found:** Check if `/api` routes are properly configured
3. **Mixed Content:** Use HTTPS for both frontend and backend in production

## 🎯 **Recommended Setup:**

For your Smart Textbook Reader:

1. **Development:** Frontend (:3000) + Backend (:5000) locally
2. **Demo:** Frontend on Vercel + Mock data (no backend needed)
3. **Production:** Full-stack on Railway/Render (better for OCR dependencies)

The empty API URL ensures your app works seamlessly whether deployed together or separately!