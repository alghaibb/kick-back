// Professional notification navigation system
export interface NotificationNavigationData {
  type: string;
  eventId?: string;
  groupId?: string; // Used for GROUP_INVITE and GROUP_EVENT_CREATED notifications
  commentId?: string;
  photoId?: string;
  inviteId?: string; // Used for GROUP_INVITE notifications (accept/decline buttons)
}

export function getNotificationUrl(data: NotificationNavigationData): string {
  const { type, eventId, commentId, photoId } = data;

  switch (type) {
    case "GROUP_INVITE":
      return "/groups";

    case "EVENT_COMMENT":
    case "COMMENT_REPLY":
    case "COMMENT_REACTION":
      if (eventId) {
        return `/calendar?event=${eventId}${commentId ? `&comment=${commentId}` : ""}`;
      }
      return "/calendar";

    case "EVENT_PHOTO":
      if (eventId) {
        return `/calendar?event=${eventId}${photoId ? `&photo=${photoId}` : ""}`;
      }
      return "/calendar";

    case "EVENT_REMINDER":
    case "RSVP_UPDATE":
      if (eventId) {
        return `/calendar?event=${eventId}`;
      }
      return "/calendar";

    case "GROUP_EVENT_CREATED":
      if (eventId) {
        return `/calendar?event=${eventId}`;
      }
      return "/events";

    case "EVENT_CREATED":
      return "/events";

    default:
      return "/";
  }
}

// Alternative: Use path-based URLs instead of query parameters
export function getNotificationPath(data: NotificationNavigationData): string {
  const { type, eventId, commentId, photoId } = data;

  switch (type) {
    case "GROUP_INVITE":
      return "/groups";

    case "EVENT_COMMENT":
    case "COMMENT_REPLY":
    case "COMMENT_REACTION":
      if (eventId) {
        return `/events/${eventId}${commentId ? `/comments/${commentId}` : ""}`;
      }
      return "/calendar";

    case "EVENT_PHOTO":
      if (eventId) {
        return `/events/${eventId}${photoId ? `/photos/${photoId}` : ""}`;
      }
      return "/calendar";

    case "EVENT_REMINDER":
    case "RSVP_UPDATE":
    case "GROUP_EVENT_CREATED":
      if (eventId) {
        return `/events/${eventId}`;
      }
      return "/calendar";

    case "EVENT_CREATED":
      return "/events";

    default:
      return "/";
  }
}
 