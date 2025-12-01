# Deployment Workflow Guide

## Overview
This guide explains how to test features in a staging environment before deploying to production.

## Git Workflow

### 1. Branch Strategy
```
main (production)     → Live site
├── staging           → Test environment
└── feature/*         → New features
```

### 2. Setup Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - ready for deployment"

# Add remote repository (GitHub, GitLab, etc.)
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

## Environment Setup

### Development (Local)
- Uses `.env` file (not committed to git)
- Run: `npm run dev`
- URL: `http://localhost:5173`

### Staging (Test Environment)
- Deploy to Vercel/Netlify with `staging` branch
- Uses staging environment variables
- URL: `your-app-staging.vercel.app`
- Test new features here before production

### Production (Live)
- Deploy to Vercel/Netlify with `main` branch
- Uses production environment variables
- URL: `your-app.vercel.app`
- This is your live site

## Deployment Workflow

### Step 1: Develop Feature
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

### Step 2: Test in Staging
```bash
# Merge to staging branch
git checkout staging
git merge feature/new-feature
git push origin staging

# Vercel/Netlify auto-deploys staging branch
# Test at: your-app-staging.vercel.app
```

### Step 3: Deploy to Production
```bash
# Once tested, merge to main
git checkout main
git merge staging
git push origin main

# Vercel/Netlify auto-deploys main branch
# Live at: your-app.vercel.app
```

## Vercel Setup (Recommended)

### 1. Connect Repository
- Go to vercel.com
- Import your GitHub repository
- Vercel will detect Vite automatically

### 2. Configure Environments

**Production (main branch):**
- Branch: `main`
- Environment Variables: Production values
- Domain: `your-app.vercel.app` (or custom domain)

**Preview (staging branch):**
- Branch: `staging`
- Environment Variables: Same as production (or test values)
- Domain: `your-app-staging.vercel.app`

**Preview (feature branches):**
- Auto-creates preview deployments for each branch
- Great for testing individual features

### 3. Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add variables for:
- **Production**: Production values
- **Preview**: Can use same or test values
- **Development**: Local `.env` file

## Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Create new feature branch
git checkout -b feature/feature-name

# Switch to staging
git checkout staging

# Switch to production
git checkout main
```

## Best Practices

1. **Always test in staging first**
   - Never push directly to `main`
   - Use `staging` branch for testing

2. **Use feature branches**
   - One feature per branch
   - Merge to staging when ready to test
   - Merge to main when ready for production

3. **Environment variables**
   - Never commit `.env` files
   - Use `.env.example` as template
   - Set variables in Vercel/Netlify dashboard

4. **Deploy workflow**
   ```
   Feature → Staging → Production
   ```

## Troubleshooting

**Issue: Changes not showing in production**
- Check if you pushed to `main` branch
- Verify environment variables are set correctly
- Check Vercel deployment logs

**Issue: Want to test without affecting production**
- Use `staging` branch
- Or create a feature branch (auto-preview in Vercel)

