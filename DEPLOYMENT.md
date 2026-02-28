# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

1. **Push to GitHub**
   ```bash
   cd /Users/samuelteiko/Desktop/eudora-babyrytmik
   git init
   git add .
   git commit -m "Initial commit: Eudora Babyrytmik app"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js
   - Click "Deploy"
   - Done! Your app is live

3. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

---

## Deploy to Netlify

### Steps

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Or use Netlify Dashboard**
   - Go to https://netlify.com
   - Drag and drop your `.next` folder
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

---

## Deploy to Traditional Hosting

### Build for Production

```bash
npm run build
npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start the app
pm2 start npm --name "babyrytmik" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t babyrytmik .
docker run -p 3000:3000 babyrytmik
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### For Database Upgrade (Future)

```env
DATABASE_URL=your_database_connection_string
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] All features tested
- [ ] Responsive design verified
- [ ] Forms validated

### ✅ Performance
- [ ] Build completes without errors
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lighthouse score > 90

### ✅ Security
- [ ] No sensitive data in code
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS configured (if using API)

### ✅ Content
- [ ] All text in Swedish
- [ ] Contact information correct
- [ ] Links working
- [ ] Images loading

---

## Post-Deployment Tasks

### 1. Test Production Site
- [ ] Register a test participant
- [ ] Access admin dashboard
- [ ] Test all filters and sorting
- [ ] Test week management
- [ ] Test CSV export
- [ ] Test on mobile devices

### 2. Monitor
- Set up error tracking (Sentry, LogRocket)
- Monitor performance (Vercel Analytics)
- Check browser console for errors

### 3. Backup
- Export initial data
- Document admin procedures
- Create backup schedule

---

## Upgrading to Database

### When to Upgrade
- More than 100 registrations
- Multiple admins
- Need for reporting
- Data backup requirements

### Recommended Stack
- **Database**: PostgreSQL (Supabase, Railway)
- **ORM**: Prisma
- **API**: Next.js API Routes
- **Auth**: NextAuth.js

### Migration Steps

1. **Set up Database**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   npx prisma init
   ```

2. **Create Schema** (`prisma/schema.prisma`)
   ```prisma
   model Registration {
     id        String   @id @default(cuid())
     firstName String
     lastName  String
     email     String
     phone     String
     location  String
     weekStart DateTime
     createdAt DateTime @default(now())
     status    String   @default("confirmed")
   }

   model WeekAvailability {
     id           String   @id @default(cuid())
     weekStart    DateTime @unique
     isAvailable  Boolean  @default(true)
     maxCapacity  Int      @default(15)
   }
   ```

3. **Create API Routes**
   - `app/api/registrations/route.ts`
   - `app/api/weeks/route.ts`

4. **Update Store**
   - Replace LocalStorage calls with API calls
   - Add loading states
   - Handle errors

5. **Migrate Data**
   ```typescript
   // Export from LocalStorage
   const data = localStorage.getItem('babyrytmik_registrations');
   // Import to database via API
   ```

---

## Monitoring & Maintenance

### Analytics
- Google Analytics
- Vercel Analytics
- Plausible (privacy-friendly)

### Error Tracking
```bash
npm install @sentry/nextjs
```

### Performance Monitoring
- Lighthouse CI
- Web Vitals
- Vercel Speed Insights

### Regular Tasks
- Weekly: Check registrations
- Monthly: Export data backup
- Quarterly: Review capacity and adjust
- Yearly: Update dependencies

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Deployment Fails
- Check build logs
- Verify Node.js version (18+)
- Check environment variables
- Verify package.json scripts

### Site Not Loading
- Check DNS settings
- Verify SSL certificate
- Check server logs
- Test with different browsers

### Data Not Persisting
- LocalStorage disabled?
- Browser privacy mode?
- Check browser console
- Verify storage.ts implementation

---

## Scaling Considerations

### Current Capacity
- **LocalStorage**: ~5-10MB
- **Registrations**: ~1000-2000 records
- **Performance**: Excellent for small scale

### When to Scale
- More than 500 active registrations
- Multiple locations (>2)
- Need for advanced reporting
- Multiple admin users

### Scaling Options
1. **Database**: PostgreSQL, MongoDB
2. **CDN**: Cloudflare, Vercel Edge
3. **Caching**: Redis
4. **Load Balancing**: Multiple instances

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind: https://tailwindcss.com

### Community
- Next.js Discord
- Stack Overflow
- GitHub Issues

### Professional Support
- Vercel Support (paid plans)
- Next.js Experts
- React Consultants

---

## Cost Estimates

### Vercel (Recommended)
- **Free Tier**: Perfect for this app
- **Pro**: $20/month (if needed)
- **Includes**: Hosting, SSL, CDN, Analytics

### Alternative Hosting
- **Netlify**: Free tier available
- **Railway**: ~$5/month
- **DigitalOcean**: ~$5/month
- **AWS/GCP**: Pay as you go

### With Database
- **Supabase**: Free tier (50K rows)
- **PlanetScale**: Free tier (1B reads)
- **Railway**: ~$5/month
- **Heroku Postgres**: ~$9/month

---

## Final Notes

- Start with Vercel free tier
- Monitor usage and scale as needed
- Keep LocalStorage for first 6 months
- Upgrade to database when necessary
- Regular backups essential
- Test thoroughly before launch
- Have rollback plan ready

## Launch Checklist

- [ ] Code deployed
- [ ] Domain configured
- [ ] SSL enabled
- [ ] All features tested
- [ ] Admin trained
- [ ] Backup system in place
- [ ] Monitoring configured
- [ ] Documentation ready
- [ ] Support plan established
- [ ] Go live! 🚀
