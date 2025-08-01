import {
  Bell,
  CalendarClock,
  Users,
  FileText,
  Shield,
  Settings,
  Calendar,
  MessageSquare,
  Image,
  Smartphone,
  Zap,
  Globe,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Palette,
  Camera,
  Clock,
  MapPin,
} from "lucide-react";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export const userMenuLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export const footerLinks = [
  { href: "/terms", label: "Terms", icon: FileText },
  { href: "/privacy", label: "Privacy", icon: Shield },
  {
    href: "/settings",
    label: "Account Settings",
    icon: Settings,
    requiresAuth: true,
  },
];

export const features = [
  {
    icon: Bell,
    title: "Automated Reminders",
    description:
      "SMS, email, or both: reminders sent automatically at the time you set during onboarding.",
  },
  {
    icon: Users,
    title: "Groups & Events",
    description:
      "Create groups, invite friends, manage all your events—keep everything organized in one place.",
  },
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    description:
      "Find the perfect time for everyone, sync with your calendar, and avoid double bookings.",
  },
];

export const allFeatures = [
  {
    icon: Calendar,
    title: "Interactive Calendar",
    description:
      "Full-featured calendar with month, week, and day views. Click any date to create events instantly.",
    highlights: [
      "Month grid view",
      "Click-to-create events",
      "RSVP tracking",
      "Event indicators",
    ],
    highlightIcons: [CheckCircle, CheckCircle, CheckCircle, CheckCircle],
  },
  {
    icon: Users,
    title: "Group Management",
    description:
      "Create and manage groups for clubs, communities, or recurring events. Keep everyone connected.",
    highlights: [
      "Group invitations",
      "Member management",
      "Group events",
      "Shared calendars",
    ],
    highlightIcons: [Star, Star, Star, Star],
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Multi-channel reminders via email, SMS, and push notifications. Customize timing and preferences.",
    highlights: [
      "Email reminders",
      "SMS notifications",
      "Push notifications",
      "Custom timing",
    ],
    highlightIcons: [CheckCircle, CheckCircle, CheckCircle, CheckCircle],
  },
  {
    icon: MessageSquare,
    title: "Event Discussions",
    description:
      "Threaded comments and replies for each event. Keep conversations organized and engaging.",
    highlights: [
      "Threaded comments",
      "Real-time updates",
      "Event-specific chats",
      "Reply system",
    ],
    highlightIcons: [Star, Star, Star, Star],
  },
  {
    icon: Image,
    title: "Photo Sharing",
    description:
      "Built-in photo galleries for each event. Share memories and relive special moments.",
    highlights: [
      "Drag & drop uploads",
      "Mobile optimized",
      "Gallery views",
      "Event collections",
    ],
    highlightIcons: [CheckCircle, CheckCircle, CheckCircle, CheckCircle],
  },
  {
    icon: Smartphone,
    title: "Mobile-First PWA",
    description:
      "Progressive Web App that works like a native app. Install on your home screen for quick access.",
    highlights: [
      "Home screen install",
      "Offline support",
      "Push notifications",
      "Native feel",
    ],
    highlightIcons: [Star, Star, Star, Star],
  },
  {
    icon: Settings,
    title: "Customizable Settings",
    description:
      "Personalize your experience with custom backgrounds, notification preferences, and more.",
    highlights: [
      "Custom backgrounds",
      "Notification settings",
      "Profile customization",
      "Theme options",
    ],
    highlightIcons: [CheckCircle, CheckCircle, CheckCircle, CheckCircle],
  },
  {
    icon: Palette,
    title: "Personal Dashboard",
    description:
      "Customize your app background with gradients or upload your own images for a personal touch.",
    highlights: [
      "Gradient presets",
      "Custom images",
      "Cross-device sync",
      "Text readability",
    ],
    highlightIcons: [Star, Star, Star, Star],
  },
  {
    icon: Camera,
    title: "Photo Management",
    description:
      "Upload and organize photos for your events. Support for multiple formats including mobile photos.",
    highlights: [
      "Multiple formats",
      "Mobile optimized",
      "Gallery organization",
    ],
    highlightIcons: [CheckCircle, CheckCircle, CheckCircle],
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description:
      "Intelligent scheduling with timezone support and automated reminders to keep everyone on track.",
    highlights: [
      "Timezone support",
      "Automated reminders",
      "Flexible timing",
      "Smart notifications",
    ],
    highlightIcons: [Star, Star, Star, Star],
  },
  {
    icon: MapPin,
    title: "Event Locations",
    description:
      "Add location information to your events so attendees know where to go.",
    highlights: ["Location details", "Optional field", "Event context"],
    highlightIcons: [CheckCircle, CheckCircle, CheckCircle],
  },
  {
    icon: FileText,
    title: "Event Details",
    description:
      "Comprehensive event information with descriptions, dates, times, and attendee management.",
    highlights: ["Rich descriptions", "Date & time", "Attendee lists"],
    highlightIcons: [Star, Star, Star],
  },
];

export const technicalFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built with Next.js 14 and React for instant loading and smooth interactions",
    highlights: [
      "Server-side rendering",
      "Optimized bundle size",
      "Instant navigation",
      "Cached responses",
    ],
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with privacy-first design principles",
    highlights: [
      "End-to-end encryption",
      "GDPR compliant",
      "No data selling",
      "Secure authentication",
    ],
  },
  {
    icon: Globe,
    title: "Always Available",
    description: "Works offline and syncs seamlessly when you're back online",
    highlights: [
      "Offline functionality",
      "Background sync",
      "Cross-device sync",
      "99.9% uptime",
    ],
  },
];

export const howItWorksSteps = [
  {
    icon: Users,
    title: "1. Create & Invite",
    description:
      "Set up your event or group, add details, and invite friends with just a few clicks.",
    highlights: ["Simple setup", "Group creation", "Easy invitations"],
  },
  {
    icon: Bell,
    title: "2. Stay Connected",
    description:
      "Automated reminders keep everyone in the loop. Get notified via email, SMS, or push notifications.",
    highlights: ["Smart reminders", "Multi-channel", "Custom timing"],
  },
  {
    icon: Heart,
    title: "3. Celebrate Together",
    description:
      "Share photos, comments, and memories. Track RSVPs and keep the conversation flowing.",
    highlights: ["Photo sharing", "Event memories", "RSVP tracking"],
  },
];

export const callToActionData = {
  title: "Ready to Get Started?",
  description:
    "Join thousands of organizers who trust Kick Back for their events",
  primaryButton: {
    text: "Create Your First Event",
    href: "/create-account",
    icon: ArrowRight,
  },
  secondaryButton: {
    text: "Get in Touch",
    href: "/contact",
  },
};

export const learnMoreData = {
  hero: {
    badge: "Discover Kick Back",
    title: "Your Complete Event Solution",
    description:
      "From planning to celebration, Kick Back streamlines every aspect of event management. Built for modern organizers who want to focus on what matters most.",
    primaryButton: {
      text: "Start Organizing",
      href: "/create-account",
    },
    secondaryButton: {
      text: "View All Features",
      href: "/features",
    },
  },
  howItWorks: {
    title: "How Kick Back Works",
    subtitle: "Three simple steps to transform your event planning",
    steps: [
      {
        icon: Users,
        title: "1. Create & Invite",
        description:
          "Set up your event or group, add details, and invite friends with just a few clicks. No complicated setup required.",
        highlights: ["Simple setup", "Group creation", "Easy invitations"],
      },
      {
        icon: Bell,
        title: "2. Stay Connected",
        description:
          "Automated reminders keep everyone in the loop. Get notified via email, SMS, or push notifications - you choose.",
        highlights: ["Smart reminders", "Multi-channel", "Custom timing"],
      },
      {
        icon: Heart,
        title: "3. Celebrate Together",
        description:
          "Share photos, comments, and memories. Track RSVPs and keep the conversation flowing before, during, and after your event.",
        highlights: ["Photo sharing", "Event memories", "RSVP tracking"],
      },
    ],
  },
  benefits: {
    title: "Why Choose Kick Back?",
    subtitle: "Everything you need for successful event planning",
    features: [
      {
        icon: Calendar,
        title: "Smart Calendar",
        description:
          "Interactive calendar view with click-to-create events. See all your gatherings at a glance and never miss an important date.",
        highlights: [
          "Month grid view",
          "Quick event creation",
          "RSVP tracking",
        ],
        highlightIcons: [CheckCircle, CheckCircle, CheckCircle],
      },
      {
        icon: Image,
        title: "Photo Sharing",
        description:
          "Capture and share memories with built-in photo galleries. Relive your events through shared photos and videos.",
        highlights: [
          "Drag & drop uploads",
          "Mobile optimized",
          "Gallery organization",
        ],
        highlightIcons: [Star, Star, Star],
      },
      {
        icon: Smartphone,
        title: "Mobile-First PWA",
        description:
          "Works perfectly on any device. Install as a PWA for a native app experience with offline capabilities.",
        highlights: [
          "Home screen install",
          "Offline support",
          "Push notifications",
        ],
        highlightIcons: [CheckCircle, CheckCircle, CheckCircle],
      },
      {
        icon: Shield,
        title: "Privacy First",
        description:
          "Your data stays yours. We don't sell or share your information. Built with security and privacy in mind.",
        highlights: [
          "End-to-end encryption",
          "GDPR compliant",
          "No data selling",
        ],
        highlightIcons: [Star, Star, Star],
      },
    ],
  },
  cta: {
    title: "Ready to Get Started?",
    description:
      "Join thousands of organizers who trust Kick Back for their events",
    primaryButton: {
      text: "Start Your First Event",
      href: "/create-account",
      icon: ArrowRight,
    },
    secondaryButton: {
      text: "Explore Features",
      href: "/features",
    },
  },
};
