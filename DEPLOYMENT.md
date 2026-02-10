# Deployment Guide for Eliade School Kiosk System

This guide will walk you through deploying the school kiosk system to Vercel and Supabase (both using free tiers).

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in:
   - **Name**: eliade-kiosk
   - **Database Password**: (Generate a secure password and save it)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free

### 1.2 Run Database Migration

1. Wait for your project to finish setting up
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-migration.sql` from this project
5. Paste it into the query editor
6. Click **Run** (bottom right)
7. You should see "Success. No rows returned"

### 1.3 Setup Storage

1. Go to **Storage** in the left sidebar
2. Click **New Bucket**
3. Name it `screenshots`
4. Make it **Public**
5. Click **Create Bucket**

6. Click on the `screenshots` bucket
7. Go to **Policies** tab
8. Add a new policy:
   - **Policy name**: Public read access
   - **Effect**: Allow
   - **Operations**: Select
   - **Target roles**: Public
   - **Definition**: `true`

### 1.4 Enable Realtime

1. Go to **Database** → **Replication** in the left sidebar
2. Find and enable replication for these tables:
   - `devices`
   - `sessions`
   - `device_students`
   - `device_activity`
   - `session_types`

### 1.5 Get API Keys

1. Go to **Settings** → **API** in the left sidebar
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)

## Step 2: Vercel Deployment

### 2.1 Prepare GitHub Repository

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a GitHub repository and push your code:
```bash
git remote add origin https://github.com/yourusername/eliade-kiosk.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **Add New...** → **Project**
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave default)

### 2.3 Add Environment Variables

In the Vercel project settings, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
ADMIN_PASSWORD=<choose_a_secure_password>
JWT_SECRET=<generate_a_random_string_32_chars_min>
NEXT_PUBLIC_APP_URL=https://eliade-ed-tehn-kiosk.vercel.app
```

**Important**: 
- For `JWT_SECRET`, use a secure random string (at least 32 characters)
- For `ADMIN_PASSWORD`, choose a strong password that teachers will use

You can generate secure values with:
```bash
# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For ADMIN_PASSWORD - choose your own or generate one
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

### 2.4 Deploy

1. Click **Deploy**
2. Wait for the deployment to complete (usually 2-3 minutes)
3. Your site will be live at `https://eliade-ed-tehn-kiosk.vercel.app`

## Step 3: Configure Custom Domain (Optional)

If you want to use `eliade-ed-tehn-kiosk.vercel.app` or a custom domain:

1. In Vercel project, go to **Settings** → **Domains**
2. The default `.vercel.app` domain is already configured
3. To add a custom domain:
   - Click **Add**
   - Enter your domain
   - Follow the DNS configuration instructions

## Step 4: Initial Setup

### 4.1 Verify Installation

1. Visit `https://eliade-ed-tehn-kiosk.vercel.app`
2. You should be redirected to `/en/kiosk`
3. The interface should load without errors

### 4.2 Test Admin Access

1. Go to `https://eliade-ed-tehn-kiosk.vercel.app/en/admin`
2. Enter the admin password you set
3. You should see the admin dashboard

### 4.3 Default Session Types

The database migration automatically creates these session types:
- SPIKE (https://spike.legoeducation.com)
- Canva (https://www.canva.com)
- Google Docs (https://docs.google.com)
- Scratch (https://scratch.mit.edu)
- TinkerCAD (https://www.tinkercad.com)

You can add more in the admin dashboard under Configuration.

## Step 5: Laptop Setup

For each student laptop:

1. Open Chrome or Edge (recommended)
2. Navigate to `https://eliade-ed-tehn-kiosk.vercel.app/en/kiosk`
3. Bookmark this page for easy access
4. Optional: Set as homepage or kiosk mode:
   - Chrome Kiosk Mode: `chrome --kiosk https://eliade-ed-tehn-kiosk.vercel.app/en/kiosk`
   - Windows Kiosk Mode: Use Assigned Access in Windows Settings

### Kiosk Mode Setup (Windows)

For true kiosk mode on Windows laptops:

1. Create a local "Device Account" on each laptop
2. Go to **Settings** → **Accounts** → **Other users**
3. Add a new user (e.g., "Student")
4. Go to **Settings** → **Accounts** → **Family & other users** → **Set up assigned access**
5. Choose the Student account
6. Select **Kiosk mode**
7. Choose **Microsoft Edge**
8. Set URL to: `https://eliade-ed-tehn-kiosk.vercel.app/en/kiosk`

## Troubleshooting

### Issue: "Failed to fetch devices"

**Solution**: Check that:
1. Supabase environment variables are correct
2. RLS policies are created properly
3. Tables exist in the database

### Issue: "Invalid password" in admin login

**Solution**: 
1. Verify `ADMIN_PASSWORD` is set correctly in Vercel environment variables
2. Redeploy after changing environment variables

### Issue: Screenshots not uploading

**Solution**:
1. Verify storage bucket exists and is public
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify storage policies allow uploads

### Issue: Real-time updates not working

**Solution**:
1. Check that Realtime is enabled for all tables in Supabase
2. Verify browser is not blocking WebSocket connections
3. Check browser console for connection errors

### Issue: Device not registering

**Solution**:
1. Clear browser localStorage
2. Refresh the page
3. Check browser console for errors
4. Verify device can connect to Supabase

## Monitoring & Maintenance

### Check Supabase Usage

1. Go to Supabase Dashboard → **Settings** → **Usage**
2. Monitor:
   - **Database size**: Free tier limit is 500MB
   - **Bandwidth**: Free tier limit is 5GB/month
   - **Realtime connections**: Free tier limit is 200 concurrent

### Check Vercel Usage

1. Go to Vercel Dashboard → **Usage**
2. Monitor:
   - **Bandwidth**: Free tier limit is 100GB/month
   - **Function Invocations**: Free tier limit is 100K/month
   - **Build minutes**: Free tier limit is 100 minutes/month

### Regular Maintenance

1. **Clean old screenshots** (monthly):
   - Go to Supabase Storage → screenshots
   - Delete old screenshot folders

2. **Clean old activity data** (quarterly):
   - Run SQL in Supabase:
   ```sql
   DELETE FROM device_activity 
   WHERE recorded_at < NOW() - INTERVAL '90 days';
   ```

3. **Backup database** (monthly):
   - Go to Supabase Dashboard → **Database** → **Backups**
   - Download a backup

## Support

For issues:
1. Check Supabase logs: Dashboard → **Logs**
2. Check Vercel logs: Deployment → **Functions** tab
3. Check browser console for client-side errors

## Security Checklist

- [ ] Admin password is strong and secure
- [ ] JWT secret is random and at least 32 characters
- [ ] Supabase service role key is kept private
- [ ] RLS policies are enabled on all tables
- [ ] Storage bucket has proper access policies
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Admin routes are protected by middleware
- [ ] Environment variables are not committed to git

## Cost Estimation (Free Tier Limits)

**Supabase Free Tier**:
- 500 MB Database
- 1 GB File storage
- 2 GB Bandwidth/month
- Good for: ~50 devices, ~1000 screenshots

**Vercel Free Tier**:
- 100 GB Bandwidth/month
- 100K Function Invocations/month  
- 100 Build minutes/month
- Good for: unlimited devices, moderate usage

If you exceed limits, you'll need to upgrade or optimize:
- Delete old screenshots
- Archive old sessions
- Consider upgrading to Supabase Pro ($25/month)

## Next Steps

After deployment:
1. Test with 2-3 devices first
2. Train teachers on the admin dashboard
3. Set up all student laptops
4. Create your first session
5. Monitor usage and performance

Congratulations! Your Eliade School Kiosk System is now deployed and ready to use!

