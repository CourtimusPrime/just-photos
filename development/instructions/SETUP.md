# Just Photos Setup Guide

This guide will help you set up the supporting services for the Just Photos application.

SUPABASE_PASSWORD=kPsVKzRsAGPZd6e

## Prerequisites

- Bun installed (https://bun.sh)
- Git
- Doppler CLI installed (https://docs.doppler.com/docs/install-cli)

## 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your service role key (keep secret)

### Database Schema

Run the following SQL in the Supabase SQL Editor to create the tables and policies:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Friendships table
CREATE TABLE friendships (
  user_id uuid,
  friend_id uuid,
  status text check (status in ('pending','accepted')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);

-- Photos table
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid,
  owner_id uuid,
  storage_path text,
  caption text,
  created_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE likes (
  photo_id uuid,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (photo_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  type text,
  actor_id uuid,
  photo_id uuid,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Friends view
CREATE VIEW friends_view AS
SELECT f1.user_id, f1.friend_id
FROM friendships f1
JOIN friendships f2 ON f1.user_id = f2.friend_id AND f1.friend_id = f2.user_id
WHERE f1.status = 'accepted' AND f2.status = 'accepted';

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Friendships: users manage their own rows
CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL USING (auth.uid() = user_id);

-- Photos: owner or friends can read
CREATE POLICY "Photos are visible to owner and friends" ON photos FOR SELECT USING (
  owner_id = auth.uid() OR owner_id IN (
    SELECT friend_id FROM friends_view WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage own photos" ON photos FOR ALL USING (auth.uid() = owner_id);

-- Likes: can like visible photos, manage own likes
CREATE POLICY "Users can view likes on visible photos" ON likes FOR SELECT USING (
  photo_id IN (
    SELECT id FROM photos WHERE owner_id = auth.uid() OR owner_id IN (
      SELECT friend_id FROM friends_view WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Notifications: users can manage own
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);

-- Storage policies
CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view photos they can access" ON storage.objects FOR SELECT USING (
  bucket_id = 'photos' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (storage.foldername(name))[1] IN (
      SELECT friend_id::text FROM friends_view WHERE user_id = auth.uid()
    )
  )
);
```

### Clerk Integration

1. Go to Authentication > Settings
2. Under "Site URL", add your local dev URL (e.g., http://localhost:3000 for backend)
3. Under "Redirect URLs", add:
   - http://localhost:3000/api/auth/callback
   - http://localhost:5173 (for frontend, if needed)

## 2. Clerk Setup

1. Create a Clerk application at https://clerk.com
2. Go to API Keys to get your publishable key and secret key
3. Configure sign-in/sign-up URLs as needed

## 3. Doppler Secrets Management

Instead of local .env files, we'll use Doppler for secure secret management.

1. Create a Doppler account at https://doppler.com
2. Create a new project (e.g., "just-photos")
3. Create environments: "dev", "prod" (or as needed)
4. Add the following secrets to your dev environment:

### Backend Secrets (web/apps/backend/)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Frontend Secrets (web/apps/frontend/)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

### Optional: Redis Secrets

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Other Services

Add API keys for Resend, OneSignal, Sentry, Plausible, etc. as needed.

5. Authenticate Doppler CLI: `doppler login`
6. Set your project and config: `doppler setup` (select your project and dev config)

## 4. Other Services

- **Resend**: For email, get API key
- **OneSignal/FCM**: For push notifications
- **Sentry**: For error tracking
- **Plausible/PostHog**: For analytics

Add their keys to Doppler secrets as needed.

## Running the Application

1. Install dependencies: `bun install`
2. Start the application with Doppler injection: `doppler run -- bun run dev` (from web/ directory)
3. The backend will run on http://localhost:3000
4. The frontend will run on http://localhost:5173

Doppler will automatically inject the secrets as environment variables.

Open the frontend in your browser to use the app.