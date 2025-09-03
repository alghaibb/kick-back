# Kick Back - Event Management App

A modern event management platform built for organizing gatherings with friends and groups. Think of it as your personal event coordinator that handles everything from planning to reminders.

## What It Does

Kick Back helps you:

- **Create and manage events** with all the details your friends need
- **Organize groups** and invite people to join
- **Handle RSVPs** so you know who's coming
- **Share photos** from your events
- **Save favorite events** for quick access with starred bookmarks
- **Get notifications** about comments, RSVPs, and reminders
- **Works as a PWA** - add it to your home screen for a native app experience

## Features

### 🎉 Events

- Create events with location, time, description, and photos
- Event colors: pick a color when creating/editing; colors render on the calendar
- Drag & Drop on calendar: move events between days with an Undo toast
- Right‑click actions on events (context menu): Edit, Move to today/tomorrow, Copy link
- **Smart Date/Time Picker** - Enhanced event creation with quick options ("In 1 hour", "Tonight", "Tomorrow morning") and popular time suggestions
- **Location Autocomplete** - Real address suggestions with proper formatting (street, suburb, postcode, city, state, country)
- Event list view to see all your upcoming events
- RSVP system with status tracking
- Event comments and reactions
- Photo sharing for each event
- Keyboard shortcuts on calendar:
  - N: create event for today
  - E: edit first event on the selected day
  - Cmd/Ctrl+K: open quick command palette (calendar focus)
  - Right‑click on empty day: quick actions (create, go to day)
- **Individual event invitations** - Invite people directly to events without requiring them to be in a group
- **Leave event functionality** - Attendees can leave events they're no longer interested in
- **Multiple invite support** - Invite multiple people at once using comma-separated emails
- **Email + in-app notifications** for event invitations
- **Accept/decline invitations** via notifications or email links
- **Event Templates** - Save reusable event configurations to speed up creating similar events
  - Template management page with create, edit, delete functionality
  - Pre-fill event forms from saved templates
  - Save events as templates while creating
  - User-scoped templates with group permission validation
- **Save/Favorite Events** - Bookmark events for quick access
  - Star any event to save it for later
  - Dedicated "Saved" tab on events page
  - Saved events count on dashboard
  - Instant optimistic updates for seamless experience

### 🔎 Quick Command Palette

- Open with Cmd/Ctrl+K on the calendar
- Actions available:
  - Create event for today
  - Edit first event on selected day
  - More actions coming soon

### 👥 Groups

- Create groups for different friend circles
- Invite people via email or phone
- Manage group members and permissions
- Group-specific events

### 🔔 Notifications

- Push notifications (works even when app is closed)
- Email notifications for important updates
- SMS reminders for events
- In-app notification center
- Notification preferences (opt in/out for different types)
- **Event invitation notifications** - Get notified when invited to events
- **Group invitation notifications** - Accept/decline group invites directly from notifications
- **Real-time notification cleanup** - Notifications disappear after accepting/declining invitations

### 📱 PWA Support

- Add to home screen on iOS and Android
- Native app-like experience
- Push notifications on mobile
- Offline page for when connection is lost

### 🔐 Authentication

- Email/password login
- Magic link authentication
- Social login options (Google, Facebook)
- Email verification for new accounts

### ⚙️ Settings & Preferences

- Customize notification preferences (in-app, SMS, push)
- Set reminder type (email only, SMS only, or both)
- Configure timezone and reminder time
- Update profile information anytime
- Manage account settings and privacy
- **Custom app backgrounds** - Upload your own images or choose from professional gradients
- **Smart image validation** - Automatic HEIC detection and format guidance for mobile users

### 🚀 Onboarding

- Complete profile setup (first name, last name, nickname)
- Profile picture upload
- Timezone and reminder time preferences
- Reminder type selection (email only, SMS only, or both)
- Phone number for SMS reminders
- All settings can be updated later in Profile & Settings pages

### 🔧 Admin Panel

- **Comprehensive dashboard** with real-time statistics and growth metrics
- **User management** - View, edit, delete, and recover user accounts
- **Event management** - Browse, edit, and manage all events across the platform
- **Group management** - Monitor and manage groups with member details
- **Contact management** - Handle contact form submissions and reply to users
- **Advanced analytics** - Track user growth, event creation, and platform activity
- **Admin-only actions** - Edit any event, manage user roles, and platform-wide operations
- **Responsive design** - Full admin functionality on mobile and desktop
- **Real-time stats** - Live updates with caching for optimal performance

### 🎨 Custom Backgrounds

- **Personalized Experience** - Upload your own background images or choose from curated gradients
- **Mobile Optimized** - Smart detection prevents HEIC uploads with helpful error messages
- **Professional Gradients** - Pre-designed backgrounds optimized for text readability
- **Cross-Device Sync** - Background preferences saved to your account and sync across all devices
- **Calendar Integration** - Calendar automatically gets solid background for optimal readability
- **Dark Mode Support** - Enhanced text contrast and readability in dark mode

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Styling and responsive design
- **Shadcn UI** - Accessible component library
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Zustand** - State management for modals and global state
- **Zod** - Schema validation and type safety

### Backend

- **Next.js API Routes** - Server-side logic
- **Prisma** - Database ORM
- **PostgreSQL** - Database (Neon via Vercel)
- **Auth.js** - Authentication
- **Resend** - Email service
- **Twilio** - SMS service
- **Vercel Blob** - File uploads
- **Rate Limiting** - API protection and abuse prevention

### PWA & Notifications

- **Next PWA** - Progressive Web App features
- **Web Push API** - Push notifications
- **Service Workers** - Background processing
- **VAPID** - Secure push messaging

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Environment variables set up

### Installation

1. **Clone the repo**

```bash
git clone https://github.com/alghaibb/kick-back.git
cd kick-back
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
# Fill in your environment variables with real values
```

4. **Set up the database**

```bash
pnpm db:generate
pnpm db:push
```

5. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

You'll need these environment variables. You can copy from the `.env.example` file or use the code block below:

<details>
<summary><strong>📋 Click to copy all environment variables</strong></summary>

```env
# Database (Neon PostgreSQL)
DATABASE_URL="your-database-url"
DATABASE_URL_UNPOOLED="your-database-url-unpooled"
PGHOST="your-pg-host"
PGHOST_UNPOOLED="your-pg-host-unpooled"
PGUSER="your-pg-user"
PGDATABASE="your-pg-database"
PGPASSWORD="your-pg-password"
POSTGRES_URL="your-postgres-url"
POSTGRES_URL_NON_POOLING="your-postgres-url-non-pooling"
POSTGRES_HOST="your-postgres-host"
POSTGRES_USER="your-postgres-user"
POSTGRES_PASSWORD="your-postgres-password"
POSTGRES_DATABASE="your-postgres-database"
POSTGRES_URL_NO_SSL="your-postgres-url-no-ssl"
POSTGRES_PRISMA_URL="your-postgres-prisma-url"

# Authentication
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_FACEBOOK_ID="your-facebook-app-id"
AUTH_FACEBOOK_SECRET="your-facebook-app-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# File Uploads (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-read-write-token"

# Push Notifications (VAPID)
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="your-vapid-email"

# Cron Jobs
CRON_SECRET="your-cron-secret"

# Client-side (Public)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
```

</details>

**Quick Setup:**

1. Create a `.env.local` or `.env` file in the root directory
2. Copy the variables above and fill in your values
3. For database, use Vercel's Neon integration or set up Neon directly
4. For VAPID keys, generate them using: `npx web-push generate-vapid-keys`

### Generating VAPID Keys

For push notifications to work, you need to generate VAPID keys:

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys

# This will output something like:
# Public Key: BPBz...
# Private Key: 4Cj...
```

Copy the public key to `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and the private key to `VAPID_PRIVATE_KEY`.

## Database Schema

The app uses PostgreSQL (Neon via Vercel) with these models:

### 👤 User Management

- **User** - User accounts, profiles, and preferences
- **Account** - OAuth provider accounts (Google, Facebook)
- **Session** - User sessions and authentication
- **VerificationOTP** - Email verification codes
- **ResetPasswordToken** - Password reset tokens
- **MagicLinkToken** - Magic link authentication tokens

### 👥 Groups & Social

- **Group** - Friend groups and communities
- **GroupMember** - Group memberships and roles
- **GroupInvite** - Group invitations and status

### 🎉 Events & Activities

- **Event** - Events with details, location, and timing
- **EventTemplate** - Reusable event templates with default settings
- **EventAttendee** - Event RSVPs and attendance tracking
- **EventComment** - Comments and replies on events
- **CommentReaction** - Emoji reactions on comments
- **EventPhoto** - Photos shared at events
- **EventPhotoLike** - Photo likes and reactions
- **EventInvite** - Individual event invitations (no group required)

### 🔔 Notifications & Communication

- **Notification** - In-app notifications with types
- **PushSubscription** - Push notification subscriptions
- **RateLimitCounter** - Rate limiting for API protection

### 📊 Notification Types

- `GROUP_INVITE` - Group invitation notifications
- `EVENT_INVITE` - Individual event invitation notifications
- `EVENT_REMINDER` - Event reminder notifications
- `EVENT_COMMENT` - New comment notifications
- `EVENT_PHOTO` - New photo notifications
- `EVENT_CREATED` - New event notifications
- `EVENT_UPDATED` - Event update notifications
- `GROUP_EVENT_CREATED` - Group event notifications
- `RSVP_UPDATE` - RSVP status changes
- `COMMENT_REPLY` - Comment reply notifications
- `COMMENT_REACTION` - Comment reaction notifications

## File Uploads & Supported Formats

### 📁 File Upload System

The app uses **Vercel Blob** for secure file storage with automatic optimization:

- **Profile Pictures** - User avatars and profile images
- **Event Photos** - Photos shared at events
- **Group Images** - Group cover photos and avatars
- **Custom Backgrounds** - User-uploaded app backgrounds

### 🖼️ Supported Image Formats

- **JPEG/JPG** - Most common format, great for photos
- **PNG** - Good for graphics and transparency
- **WebP** - Modern format with better compression
- **GIF** - Animated images and simple graphics

### 📱 Mobile Optimization

- **HEIC Detection** - Automatic detection and blocking of HEIC files (iPhone default)
- **File Size Limits** - Optimized limits per upload type:
  - Profile pictures: 2MB
  - Event photos: 10MB
  - Group images: 4MB
  - Custom backgrounds: 5MB
- **Error Handling** - Clear error messages guide users to compatible formats

### 🔧 Technical Details

- **Vercel Blob** - Scalable file storage with CDN
- **Automatic Optimization** - Images are optimized for web delivery
- **Client-side Compression & Progress** - Photos are compressed before upload and show a progress bar during upload
- **Public Access** - Files are publicly accessible via CDN
- **Organized Structure** - Files are organized by type and user ID

### 🧪 Testing Photo Upload Progress

1. Open any event and navigate to the Photos section.
2. Select one or more larger images (5–10MB) to clearly see progress.
3. Watch the in-form progress bar while upload runs.
4. Optional: In Chrome DevTools → Network → Throttle to "Slow 3G" to exaggerate progress.
5. You can verify compression via the Network panel request size vs original file size.

## API Routes & Server Actions

The app uses both **API Routes** and **Server Actions** for different purposes:

### 🔐 Authentication (Server Actions)

- `login()` - User login with rate limiting
- `createAccount()` - User registration with email verification
- `forgotPassword()` - Password reset via email
- `resetPassword()` - Set new password
- `verifyAccount()` - Email verification
- `magicLinkCreate()` - Send magic link
- `magicLinkLogin()` - Magic link authentication
- `magicLinkVerify()` - Verify magic link
- `resendOTP()` - Resend verification code

### 🎉 Events (Server Actions)

- `createEventAction()` - Create new event with timezone handling
- `editEventAction()` - Update event details
- `deleteEventAction()` - Delete event
- `createEventTemplateAction()` - Create reusable event template
- `editEventTemplateAction()` - Update event template
- `deleteEventTemplateAction()` - Delete event template
- `getUserEventTemplatesAction()` - Get user's event templates
- `getEventTemplateAction()` - Get specific event template
- `inviteToEventAction()` - Send individual event invitations
- `acceptEventInviteAction()` - Accept event invitations
- `leaveEventAction()` - Leave an event (for attendees)
- `createCommentAction()` - Add comment to event
- `createReplyAction()` - Reply to comment
- `editCommentAction()` - Edit comment
- `deleteCommentAction()` - Delete comment
- `toggleReactionAction()` - Like/unlike comment
- `savePhotoMetadataAction()` - Save photo to event
- `likePhotoAction()` - Like/unlike photo
- `deletePhotoAction()` - Delete photo

### 👥 Groups (Server Actions)

- `createGroupAction()` - Create new group
- `inviteToGroupAction()` - Invite user to group
- `acceptGroupInviteAction()` - Accept group invitation
- `updateGroupMemberRoleAction()` - Change member role
- `removeGroupMemberAction()` - Remove member from group
- `deleteGroupAction()` - Delete group
- `leaveGroupAction()` - Leave group
- `editGroupAction()` - Update group details

### 👤 Profile & Settings (Server Actions)

- `updateProfileAction()` - Update user profile (name, nickname, photo)
- `updateSettingsAction()` - Update user settings (timezone, reminders, notification preferences)
- `changePasswordAction()` - Change password
- `deleteAccountAction()` - Delete user account
- `onboarding()` - Complete user onboarding

### 🔧 Admin (Server Actions)

- `adminEditEventAction()` - Admin can edit any event on the platform
- `replyToContact()` - Reply to contact form submissions
- `deleteContact()` - Delete contact messages
- `editUserAction()` - Edit user profiles and settings
- `deleteUserAction()` - Delete user accounts
- `recoverUserAction()` - Recover deleted user accounts

### 📱 API Routes

- `GET /api/events` - List events
- `GET /api/groups` - List groups
- `GET /api/notifications` - List notifications
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `PATCH /api/notifications/read-all` - Mark all as read
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/calendar` - Calendar data
- `POST /api/blob/upload` - File uploads
- `POST /api/cron/send-event-reminders` - Send event reminders
- `POST /api/cron/clean-events` - Clean old events

### 🔧 Admin API Routes

- `GET /api/admin/stats` - Admin dashboard statistics
- `GET /api/admin/users` - List all users with pagination
- `GET /api/admin/contacts` - List contact form submissions
- `GET /api/admin/deleted-users` - List deleted user accounts
- `GET /api/admin/events` - List all events with attendee details
- `GET /api/admin/groups` - List all groups with member details

### 🎉 Event Invitation API Routes

- `GET /api/events/invites/[inviteId]` - Get event invitation details
- `POST /api/events/invites/[inviteId]/accept` - Accept event invitation
- `POST /api/events/invites/[inviteId]/decline` - Decline event invitation

## PWA Features

### Installation

- **iOS**: Tap share button → "Add to Home Screen"
- **Android**: Tap menu → "Add to Home Screen"
- **Desktop**: Click install button in browser

### Push Notifications

- Works when app is closed
- Handles iOS PWA limitations
- Auto-syncs subscription state
- Supports all notification types

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── (main)/         # Main app pages
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── providers/         # React context providers
└── validations/       # Zod schemas
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify** - Static hosting with serverless functions
- **Railway** - Full-stack deployment
- **DigitalOcean** - VPS deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you run into issues:

1. Check the [Issues](https://github.com/alghaibb/kick-back/issues) page
2. Create a new issue with details about your problem
3. Include your environment and steps to reproduce

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

# Force Vercel rebuild
