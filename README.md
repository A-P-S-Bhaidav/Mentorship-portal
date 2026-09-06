# Empressario Mentorship Portal

A professional, premium three-portal mentorship platform connecting startups with experienced mentors (Angel Investors and VC professionals) through structured, ongoing mentorship engagements.

## Architecture

The platform consists of three role-based portals:

- **Mentor Portal** — Manage assigned startups, view pitch decks, track meetings
- **Startup Portal** — Access mentor profiles, schedule sessions via Calendly, manage profile
- **Admin Panel** — Oversee all assignments, match mentors with startups, view platform analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Styling | Vanilla CSS with design tokens |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| Calendar | Calendly embed integration |
| Font | Inter (Google Fonts) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/A-P-S-Bhaidav/Mentorship-portal.git
cd Mentorship-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **Anon Key** from Settings > API
3. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up the Database

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase_setup.sql`
4. Click **Run** to create all tables, indexes, RLS policies, and triggers

### 5. Create an Admin User

1. Register through the app as a regular user (mentor or startup)
2. In Supabase Dashboard, go to **Table Editor > profiles**
3. Find your user and change the `role` column to `admin`

Or run this SQL after registering:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.

## Project Structure

```
src/
  app/
    page.js                    # Landing page
    layout.js                  # Root layout with AuthProvider
    globals.css                # Design system & global styles
    auth/
      login/                   # Unified login page
      register/
        mentor/                # Mentor registration
        startup/               # Startup registration
    mentor/
      layout.js                # Mentor portal layout + role guard
      dashboard/               # Assigned startups dashboard
      startups/[id]/           # Individual startup detail
      meetings/                # Meeting history
      profile/                 # Profile management
    startup/
      layout.js                # Startup portal layout + role guard
      dashboard/               # Startup home dashboard
      profile/                 # Profile management
      mentor/                  # Assigned mentor + Calendly booking
      meetings/                # Meeting history
    admin/
      layout.js                # Admin panel layout + role guard
      dashboard/               # Platform analytics & insights
      mentors/                 # Mentor management
      startups/                # Startup management
      matching/                # Mentor-startup matching interface
      assignments/             # Assignment overview
  components/
    Sidebar.js                 # Role-aware sidebar navigation
  context/
    AuthContext.js             # Authentication context provider
  lib/
    supabase.js                # Supabase client initialization
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to Supabase Auth (id, email, role, full_name) |
| `mentors` | Mentor data (firm, role_type, expertise[], bio, calendly_link, max_startups) |
| `startups` | Startup data (startup_name, founder_name, sector, stage, pitch_deck_url) |
| `assignments` | Mentor-startup pairings with status tracking |
| `meetings` | Meeting records with scheduling and status |

## Role-Based Access Control

- **Admin**: Full access to all data, matching, and assignments
- **Mentor**: Access to own profile and assigned startups only
- **Startup**: Access to own profile and assigned mentor only

RLS (Row Level Security) is enforced at the database level via Supabase policies.

## Calendly Integration

Mentors paste their Calendly scheduling link in their profile. Startups see the embedded Calendly widget directly in the Startup Portal to book mentoring sessions without leaving the platform.

## Pitch Decks

Startups provide their pitch deck as a **Google Drive share link** during registration. Mentors and admins can view it by clicking the link, which opens in a new tab.

## License

This project is proprietary to Empressario.
