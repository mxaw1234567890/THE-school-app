# Full School App - Deployment Guide

## Prerequisites
- GitHub repository created and synced (THE-school-app)
- Supabase project created and database tables initialized
- Environment variables from Supabase

## Step 1: Prepare Your GitHub Repository

Your code is already pushed to GitHub at `THE-school-app`. Ensure you have:

\`\`\`bash
git add .
git commit -m "Full School App - Ready for deployment"
git push origin main
\`\`\`

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New" → "Project"**
3. Select your **THE-school-app** repository
4. Click **"Import"**

### Configure Environment Variables

Add these environment variables in Vercel:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

5. Click **"Deploy"**

Your app will be live at `https://[project-name].vercel.app` in 1-2 minutes.

## Step 3: Initialize Database (First Time Only)

After deployment, run the database migration:

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste contents of `scripts/001_create_tables.sql`
4. Click "Run"

## Step 4: Add Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records with Vercel's nameservers

## Auto-Deployment

Every time you push to `main`:
- GitHub notifies Vercel
- Vercel automatically rebuilds and deploys
- Your live site updates within 2-3 minutes

## Troubleshooting

- **Build fails**: Check that `NEXT_PUBLIC_SUPABASE_*` variables are set in Vercel
- **Database errors**: Ensure SQL migration has been run in Supabase
- **Auth issues**: Verify Supabase RLS policies are enabled
