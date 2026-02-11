# Quick Setup Instructions

This document provides quick instructions to get the Eliade School Kiosk System up and running locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the migration from `supabase-migration.sql`
4. Create a storage bucket named `screenshots` (make it public)
5. Go to Settings → API and copy your project URL and keys

### 3. Create Environment File

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-secret-key-at-least-32-characters-long

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auto-Login (Optional - for automatic platform login)
AUTO_LOGIN_EMAIL=elevi.ed.tehn.eliade@gmail.com
AUTO_LOGIN_PASSWORD=Pereu@1973
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Access Points

- **Kiosk Interface**: http://localhost:3000/en/kiosk
- **Admin Dashboard**: http://localhost:3000/en/admin
- **Romanian Kiosk**: http://localhost:3000/ro/kiosk
- **Romanian Admin**: http://localhost:3000/ro/admin

## Testing

### Test as a Student (Kiosk)

1. Go to http://localhost:3000/en/kiosk
2. Click "Add Student" and enter names
3. Wait for admin to create a session (or open admin in another window)

### Test as a Teacher (Admin)

1. Go to http://localhost:3000/en/admin
2. Enter your admin password (default: admin123)
3. Create a new session:
   - Click "Create Session"
   - Enter session name
   - Select session type (e.g., Canva)
   - Click "Start Session"
4. The kiosk should automatically redirect to the session

## Default Session Types

The system comes pre-configured with:
- **SPIKE** - LEGO Education robotics platform
- **Canva** - Design and collaboration tool
- **Google Docs** - Document creation
- **Scratch** - Block-based programming
- **TinkerCAD** - 3D design platform

You can add more in the admin dashboard under Configuration tab.

## Troubleshooting

### "Cannot connect to Supabase"
- Check that your `.env.local` file has correct Supabase credentials
- Verify your Supabase project is active

### "Admin password incorrect"
- Check `ADMIN_PASSWORD` in `.env.local`
- Default password is `admin123`

### "Screenshots not uploading"
- Verify the `screenshots` storage bucket exists in Supabase
- Check that it's set to public
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### "Device not registering"
- Clear browser localStorage: `localStorage.clear()`
- Refresh the page
- Check browser console for errors

## Building for Production

```bash
npm run build
npm start
```

## Next Steps

See `DEPLOYMENT.md` for detailed deployment instructions to Vercel and Supabase.

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── kiosk/        # Student interface
│   │   └── admin/        # Teacher dashboard
│   └── api/              # Backend API routes
├── components/
│   ├── kiosk/            # Kiosk components
│   ├── admin/            # Admin components
│   ├── shared/           # Shared components
│   └── ui/               # UI library
├── lib/
│   ├── supabase/         # Database clients
│   ├── hooks/            # React hooks
│   ├── stores/           # State management
│   └── utils/            # Helper functions
└── types/                # TypeScript definitions
```

## Key Features to Test

### Kiosk Features
- [x] Student name entry
- [x] Language toggle (EN/RO)
- [x] Automatic session detection
- [x] Session viewer with iframe
- [x] Activity tracking
- [x] Battery status display
- [x] Device settings (password protected)

### Admin Features
- [x] Login with password
- [x] Real-time device monitoring
- [x] Session creation and management
- [x] Device renaming
- [x] Screenshot viewing
- [x] Activity metrics
- [x] Session type configuration
- [x] Language toggle (EN/RO)

## Support

For detailed documentation, see:
- `README.md` - Complete project documentation
- `DEPLOYMENT.md` - Production deployment guide
- `supabase-migration.sql` - Database schema

For issues, check the browser console and Supabase logs for error messages.

