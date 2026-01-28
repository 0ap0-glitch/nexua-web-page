# NEXUS Vercel Deployment Handoff Document

## Current Status (70% Complete)

### ✅ COMPLETED WORK

1. **Database Migration to PostgreSQL**
   - Converted entire schema from MySQL → PostgreSQL
   - Connected to Neon database: `postgresql://neondb_owner:npg_3veKskBgJ4Dx@ep-winter-feather-ahodxzah-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - All 15 tables created successfully
   - Removed AI companion features (table, routes, UI)

2. **Code Cleanup**
   - Removed all AI companion references
   - Fixed TypeScript type errors (boolean vs number)
   - Updated drizzle-orm to use PostgreSQL driver
   - Installed `postgres` package for connection

3. **Schema Changes**
   - Changed `mysqlTable` → `pgTable`
   - Changed `int().autoincrement()` → `serial()`
   - Changed `mysqlEnum` → `varchar` with validation
   - Changed `onDuplicateKeyUpdate` → `onConflictDoUpdate`
   - Changed boolean fields from `int(0/1)` → `boolean(true/false)`

### ⏳ REMAINING WORK (30%)

#### 1. Fix Authentication System
**Current Problem:** Uses Manus OAuth which won't work on Vercel

**Solution Options:**
- **Option A (Simplest):** Use Neon Auth (already have database)
  - Enable Neon Auth in console
  - Update `server/_core/auth.ts` to use Neon Auth
  - Keep same user table structure
  
- **Option B:** Implement simple email/password
  - Add password field to users table
  - Create `/api/auth/register` and `/api/auth/login` endpoints
  - Use JWT for sessions

**Files to modify:**
- `server/_core/auth.ts`
- `server/_core/context.ts`
- `client/src/pages/Home.tsx` (login UI)

#### 2. Convert to Vercel Serverless
**Current Problem:** Express server won't work on Vercel

**What to do:**
1. Create `api/` directory in project root
2. Move tRPC handler to `api/trpc/[trpc].ts`:
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../server/routers';
import { createContext } from '../../server/_core/context';

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });
}

export const config = {
  runtime: 'edge',
};
```

3. Update `vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/client",
  "rewrites": [
    {
      "source": "/api/trpc/(.*)",
      "destination": "/api/trpc/[trpc]"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

#### 3. Configure Vercel Environment Variables
Go to Vercel dashboard → Settings → Environment Variables:

**Required:**
```
DATABASE_URL=postgresql://neondb_owner:npg_3veKskBgJ4Dx@ep-winter-feather-ahodxzah-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<generate-random-secret>
NODE_ENV=production
```

#### 4. Push to GitHub
```bash
cd /home/ubuntu/nexus
git add .
git commit -m "Convert to Vercel serverless with PostgreSQL"
git push origin main
```

Use token: `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`

#### 5. Deploy on Vercel
1. Go to vercel.com
2. Import `0ap0-glitch/nexua-web-page`
3. Add environment variables
4. Deploy

## Key Files Modified

### Database
- `drizzle/schema.ts` - PostgreSQL schema
- `drizzle.config.ts` - PostgreSQL connection
- `server/db.ts` - PostgreSQL driver, removed AI functions
- `server/dbThreads.ts` - Fixed boolean comparisons

### Backend
- `server/routers.ts` - Removed AI companion router, fixed types
- `server/_core/context.ts` - Will need auth updates

### Frontend
- `client/src/pages/Home.tsx` - Will need login UI updates
- `client/src/App.tsx` - Routes configured

## Testing Checklist

After deployment, test:
- [ ] User registration works
- [ ] User login works
- [ ] Communities load
- [ ] Discussion threads display
- [ ] Can create posts
- [ ] Widgets render
- [ ] Database connections stable

## Known Issues

1. **Dev server shows old errors** - These are cached, restart clears them
2. **No authentication yet** - Must implement before deployment
3. **Manus-specific code** - Some `_core` files still reference Manus services

## Database Tables (15 total)

1. users - User accounts
2. pages - User pages
3. widgets - Widget instances
4. communities - Community spaces
5. communityMembers - Membership
6. communityWidgets - Custom community widgets
7. communityTemplates - Templates
8. posts - Community posts
9. threads - Discussion threads
10. threadReplies - Thread replies
11. reactions - Reactions
12. connections - User connections
13. featureFlags - Feature flags
14. events - Community events
15. eventRsvps - Event RSVPs

## Contact Info

- GitHub Repo: https://github.com/0ap0-glitch/nexua-web-page
- Neon Database: https://console.neon.tech
- Vercel: https://vercel.com

## Next Steps Summary

1. Choose auth method (Neon Auth recommended)
2. Create `/api` directory with serverless functions
3. Update `vercel.json`
4. Add environment variables to Vercel
5. Push to GitHub
6. Deploy and test

**Estimated time to complete: 1-2 hours**
