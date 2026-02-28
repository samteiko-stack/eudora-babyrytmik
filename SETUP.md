# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Landing Page: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

## First Time Setup

### Test the Application

1. **Register a Participant**
   - Go to http://localhost:3000
   - Fill out the registration form
   - Select a location (Södermalm or Gärdet)
   - Choose a week
   - Submit the form

2. **View in Admin Dashboard**
   - Go to http://localhost:3000/admin
   - See your registration in the participants table
   - Try filtering, sorting, and searching

3. **Test Week Management**
   - Click "Hantera veckor" (Manage weeks)
   - Toggle week availability
   - Go back to landing page and verify the week is hidden

4. **Add Manual Registration**
   - In admin dashboard, click "Lägg till deltagare"
   - Fill out the form
   - Submit and see it appear in the table

## Features to Test

### Landing Page
- ✅ Form validation
- ✅ Week selection (10 weeks advance)
- ✅ Available spots counter
- ✅ Full week blocking
- ✅ Location selection

### Admin Dashboard
- ✅ Statistics cards
- ✅ Week overview table
- ✅ Participant table with sorting
- ✅ Search functionality
- ✅ Filter by week and location
- ✅ Delete registrations
- ✅ Manual participant addition
- ✅ Week availability management
- ✅ CSV export

## Data Storage

Currently uses **LocalStorage** for data persistence:
- Data persists in browser
- Survives page refreshes
- Separate for each browser/device

To clear all data:
```javascript
// Open browser console and run:
localStorage.clear()
```

## Production Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
```bash
npm run build
npm start
```

## Upgrading to Database

See README.md for instructions on upgrading from LocalStorage to a database.

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Support

For issues or questions, refer to:
- README.md for detailed documentation
- Next.js documentation: https://nextjs.org/docs
- React Hook Form: https://react-hook-form.com
