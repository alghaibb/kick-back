export type CalendarEvent = {
  id: string;
  name: string;
  description?: string;
  date: string | Date;
  location?: string;
  group?: { name: string };
  attendees: { user: { id: string; nickname?: string; firstName?: string } }[];
};
