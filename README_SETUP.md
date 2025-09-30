# Project Tracker - Setup Guide

## Quick Setup (Automated)

### Windows Users
1. Double-click `fix_all.bat` to automatically fix everything
2. The script will:
   - Fix git environment configuration
   - Create environment files
   - Install all dependencies
   - Run database migrations
   - Start development servers
   - Commit all changes

### Manual Setup

#### 1. Environment Configuration
```bash
# Copy environment templates
cp env.example .env
cp backend/env.example backend/.env
```

#### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
```

#### 3. Database Setup
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### 4. Start Development Servers
```bash
# Terminal 1 - Django Backend
cd backend
python manage.py runserver

# Terminal 2 - Vite Frontend
npm run dev
```

## Git Configuration Fix

If you encounter git issues, run:
```bash
# Fix git environment
fix_git_env.bat

# Or manually configure:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf true
git config --global credential.helper manager-core
```

## Environment Variables

### Frontend (.env)
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_DEBUG`: Enable debug mode
- `VITE_DEFAULT_PAGE_SIZE`: Default pagination size

### Backend (backend/.env)
- `DEBUG`: Django debug mode
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection string
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

## Troubleshooting

### Git Issues
- Use Git Bash instead of Command Prompt
- Ensure Git is in your PATH
- Run `fix_git_env.bat` for automatic fix

### Shell Issues
- Use PowerShell or Git Bash
- Avoid Command Prompt if you get "spawn /bin/sh ENOENT"

### Port Issues
- Django: http://localhost:8000
- Vite: http://localhost:3000
- Change ports in respective config files if needed

## Project Structure
```
project-tracker/
├── backend/                 # Django backend
│   ├── projects/           # Projects app
│   ├── authentication/     # Auth app
│   └── manage.py
├── src/                    # React frontend
│   ├── modules/           # Feature modules
│   ├── shared/            # Shared components
│   └── main.jsx
├── fix_all.bat            # Auto-fix script
├── fix_git_env.bat        # Git fix script
└── README_SETUP.md        # This file
```

## Features Fixed
- ✅ Form validation for budget, filiales, chef de projet
- ✅ Git environment configuration
- ✅ Environment file setup
- ✅ Development server configuration
- ✅ Database migrations
- ✅ Dependency installation
