# Just Photos — Core Architecture & Security Spec (v1.0)

## 1. Product Definition

**Just Photos** is a minimalist, private social media application.

**Core rules:**

* Photos only (single or carousel)
* Friends-only visibility
* No public content
* No stats or analytics shown to users
* Likes trigger notifications only
* Posting over 50 photos requires payment
* No ads, no algorithmic feed, no video

---

## 2. Technology Stack

**Frontend**

* React
* Next.js (Vercel)

**Backend / Data**

* Supabase (Postgres, Storage, RLS, Edge Functions)
* Clerk (Authentication)

**Infrastructure**

* Vercel (Frontend)
* Railway (API / workers if needed)
* Cloudflare (CDN, WAF, bot protection)

**Supporting Services**

* Upstash Redis (Caching + rate limiting)
* Resend (Transactional email)
* OneSignal / FCM (Notifications)
* Sentry (Error tracking)
* Plausible / PostHog (Internal analytics)

---

## 3. Data Model

### 3.1 Profiles

```sql
profiles (
  id uuid PK, -- auth.uid()
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz
)
```

---

### 3.2 Friendships

Directional friendship model.

```sql
friendships (
  user_id uuid,
  friend_id uuid,
  status text check ('pending','accepted'),
  created_at timestamptz,
  PK (user_id, friend_id)
)
```

**Accepted friendship = two reciprocal rows.**

---

### 3.3 Photos

```sql
photos (
  id uuid PK,
  post_id uuid,
  owner_id uuid,
  storage_path text,
  caption text,
  created_at timestamptz
)
```

Each photo is a row. Carousels share `post_id`.

---

### 3.4 Likes

```sql
likes (
  photo_id uuid,
  user_id uuid,
  created_at timestamptz,
  PK (photo_id, user_id)
)
```

---

### 3.5 Notifications

```sql
notifications (
  id uuid PK,
  user_id uuid,
  type text,
  actor_id uuid,
  photo_id uuid,
  created_at timestamptz,
  read_at timestamptz
)
```

---

## 4. Helper View

### friends_view

```sql
select f1.user_id, f1.friend_id
from friendships f1
join friendships f2
  on f1.user_id = f2.friend_id
 and f1.friend_id = f2.user_id
where f1.status = 'accepted'
  and f2.status = 'accepted';
```

Used by all access-control logic.

---

## 5. Row Level Security (RLS)

### Principles

* Nothing is public
* RLS enabled on every table
* Frontend checks are decorative only

---

### 5.1 Photos — Read

* Owner can read
* Accepted friends can read

```sql
owner_id = auth.uid()
OR owner_id IN (friends_view)
```

---

### 5.2 Photos — Write

* Insert/delete allowed only by owner

---

### 5.3 Friendships

* Users manage only their own row

---

### 5.4 Likes

* Can like only visible photos
* Can remove own likes only

---

### 5.5 Notifications & Subscriptions

* Read/update own rows only

---

## 6. Signed Image Delivery (End-to-End)

### 6.1 Storage

* Supabase private bucket: `photos`
* Path format:

```
photos/{owner_id}/{photo_id}.jpg
```

---

### 6.2 Access Flow

```
Client → API Route → RLS DB Check → Signed URL → CDN → Image
```

---

### 6.3 API Contract

```
GET /api/photos/{photo_id}/signed-url
```

Steps:

1. Authenticate via Clerk
2. Query `photos` table (RLS enforced)
3. If row exists, user is authorized
4. Generate signed URL (60s TTL)
5. Return URL

---

### 6.4 Redis Integration

**Keys**

* `photo:signed:{photo}:{viewer}` (TTL 30–55s)
* `photo:perm:{viewer}:{photo}` (TTL 30–60s)

Redis is an optimization only. DB remains authoritative.

---

### 6.5 CDN & Anti-Scraping

* Cloudflare in front of Vercel
* Cache signed URLs only for TTL
* Rate-limit signed URL endpoint
* Bot protection enabled

---

## 7. Friend Request Lifecycle

### 7.1 Send Request

```sql
insert into friendships (user_id, friend_id, status)
values (me, them, 'pending');
```

---

### 7.2 Accept Request (Transaction)

```sql
update friendships set status='accepted'
where user_id=them and friend_id=me;

insert into friendships (user_id, friend_id, status)
values (me, them, 'accepted');
```

---

### 7.3 Decline / Cancel

```sql
delete from friendships
where user_id=them and friend_id=me;
```

---

### 7.4 Unfriend

Delete both rows. Access revoked instantly.

---

## 8. Feed Query (Safe Default)

```sql
select * from photos
where owner_id = auth.uid()
   or owner_id in (
     select friend_id from friends_view
     where user_id = auth.uid()
   )
order by created_at desc
limit 50;
```

---

## 9. Upload & Limits

* Photo limit enforced via DB trigger
* Frontend limits are advisory only

---

## 10. Failure & Security Model

| Scenario           | Outcome                |
| ------------------ | ---------------------- |
| Friendship revoked | Signed URLs expire     |
| Redis outage       | DB fallback            |
| User downgraded    | Inserts blocked        |
| Scraping attempts  | Rate limited / blocked |

---

## 11. Explicit Non-Goals

* Public content
* Sharing links
* Follower model
* Algorithmic ranking
* Ads or tracking SDKs

---

## 12. Next Expansion Areas

* Upload pipeline
* Blocking & abuse model
* Cursor-based pagination
* Mobile push notifications

---

**This spec is authoritative.**
Any feature not described here does not exist.
