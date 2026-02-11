# Mircea Eliade School Kiosk Management System

A comprehensive school laptop management system built with Next.js, Supabase, and TypeScript. This system allows teachers to monitor and manage student laptops in real-time during educational sessions.

## Features

### Student Kiosk Interface (`/kiosk`)
- **Multi-student name entry** - Students can add their names before starting
- **Real-time session synchronization** - Automatically redirects to active sessions
- **Embedded content viewer** - Display educational platforms (SPIKE, Canva, etc.) in iframe
- **Activity tracking** - Monitors mouse and keyboard activity
- **Screenshot capture** - Periodic screenshots for teacher monitoring
- **Battery monitoring** - Display battery level and charging status
- **Bilingual support** - Toggle between English and Romanian

### Admin Dashboard (`/admin`)
- **Real-time device monitoring** - Live view of all connected devices
- **Session management** - Create, start, pause, and end sessions
- **Device management** - Rename and remove devices
- **Activity analytics** - View uptime, battery, and activity metrics
- **Screenshot viewing** - See latest screenshots from each device
- **Configurable session types** - Add custom educational platforms
- **Student tracking** - See which students are on each device
- **Bilingual interface** - English and Romanian language support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **UI Components**: Radix UI, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Realtime, Storage)
- **State Management**: Zustand + Supabase Realtime
- **Authentication**: JWT with HTTP-only cookies
- **i18n**: next-intl
- **Hosting**: Vercel (free tier compatible)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Vercel account (for deployment)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd eliade-ed-tehn-kiosk
```

2. Install dependencies
```bash
npm install
```

3. Create a Supabase project
- Go to [supabase.com](https://supabase.com) and create a new project
- Run the migration SQL from `supabase-migration.sql` in the SQL Editor
- Create a storage bucket named `screenshots` with public access

4. Set up environment variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_jwt_secret_key_min_32_chars

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auto-Login (Optional - for automatic platform login)
AUTO_LOGIN_EMAIL=elevi.ed.tehn.eliade@gmail.com
AUTO_LOGIN_PASSWORD=Pereu@1973
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

Run the SQL migration in your Supabase project to create all necessary tables:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Paste the contents of `supabase-migration.sql`
4. Click "Run"

This will create:
- `devices` - Store device information
- `sessions` - Track educational sessions
- `session_types` - Configure available platforms (SPIKE, Canva, etc.)
- `device_students` - Link students to devices
- `device_activity` - Track activity and screenshots
- `settings` - Store system configuration

### Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `screenshots`
3. Set it to public
4. Add a policy to allow public read access

## Project Structure

```
/
├── public/              # Static assets
├── messages/            # i18n translation files
├── src/
│   ├── app/
│   │   ├── [locale]/   # Localized routes
│   │   │   ├── kiosk/  # Student kiosk interface
│   │   │   └── admin/  # Admin dashboard
│   │   └── api/        # API routes
│   ├── components/
│   │   ├── kiosk/      # Kiosk-specific components
│   │   ├── admin/      # Admin-specific components
│   │   ├── shared/     # Shared components
│   │   └── ui/         # UI library (shadcn)
│   ├── lib/
│   │   ├── supabase/   # Supabase clients
│   │   ├── hooks/      # Custom React hooks
│   │   ├── stores/     # Zustand stores
│   │   └── utils/      # Utility functions
│   └── types/          # TypeScript types
└── supabase-migration.sql  # Database schema
```

## Usage

### For Students (Kiosk Mode)

1. Navigate to `/kiosk`
2. Add your name(s) using the + button
3. Wait for the teacher to start a session
4. You'll be automatically redirected to the session platform

### For Teachers (Admin Dashboard)

1. Navigate to `/admin`
2. Enter the admin password
3. Use the dashboard to:
   - View all connected devices and student activity
   - Create and manage sessions
   - Configure session types
   - Monitor device health and battery status

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

Make sure to set these in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)

## Configuration

### Adding New Session Types

1. Go to Admin Dashboard → Configuration tab
2. Click "Add Session Type"
3. Fill in:
   - Name (e.g., "Google Docs")
   - URL Template (e.g., "https://docs.google.com")
   - Enable iframe embedding
   - Allow URL preview (for collaborative platforms)

### Device Settings

Each device has local settings accessible via the Settings button:
- Requires admin password
- Can rename device
- Can reset device registration

## Security Notes

- Admin password is stored in environment variables
- JWT tokens are HTTP-only cookies (7-day expiry)
- Row Level Security (RLS) is enabled on Supabase tables
- Device identification uses browser fingerprinting + localStorage

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (limited Battery API support)

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

