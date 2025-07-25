export type RSVPStatus = "pending" | "yes" | "no" | "maybe";

export interface RSVPResponse {
  eventId: string;
  userId: string;
  status: RSVPStatus;
  rsvpAt?: Date;
}

export interface EventAttendeeWithRSVP {
  id: string;
  eventId: string;
  userId: string;
  rsvpStatus: RSVPStatus;
  rsvpAt: Date | null;
  invitedAt: Date;
  lastReminderSent: Date | null;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    nickname: string | null;
    email: string;
    image: string | null;
  };
}

export interface RSVPSummary {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  pending: number;
} 