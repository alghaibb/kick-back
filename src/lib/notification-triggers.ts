import { notifyUser, NotificationTemplates } from "./notifications";

// Example: Trigger notification when someone gets invited to a group
export async function notifyGroupInvite(data: {
  userId: string;
  groupId: string;
  groupName: string;
  inviterName: string;
  inviteId: string;
}) {
  const template = NotificationTemplates.GROUP_INVITE(
    data.groupName,
    data.inviterName
  );

  await notifyUser(
    {
      userId: data.userId,
      type: "GROUP_INVITE",
      title: template.title,
      message: template.message,
      data: {
        type: "GROUP_INVITE",
        groupId: data.groupId,
        inviteId: data.inviteId,
      },
    },
    {
      title: template.pushTitle,
      body: template.pushBody,
      data: {
        type: "GROUP_INVITE",
        groupId: data.groupId,
        inviteId: data.inviteId,
      },
      actions: [
        { action: "view", title: "View Invite" },
        { action: "dismiss", title: "Dismiss" },
      ],
    }
  );
}

export async function notifyEventInvite(data: {
  userId: string;
  eventId: string;
  eventName: string;
  inviterName: string;
  inviteId: string;
}) {
  const template = NotificationTemplates.EVENT_INVITE(
    data.eventName,
    data.inviterName
  );

  await notifyUser(
    {
      userId: data.userId,
      type: "EVENT_INVITE",
      title: template.title,
      message: template.message,
      data: {
        type: "EVENT_INVITE",
        eventId: data.eventId,
        inviteId: data.inviteId,
      },
    },
    {
      title: template.pushTitle,
      body: template.pushBody,
      data: {
        type: "EVENT_INVITE",
        eventId: data.eventId,
        inviteId: data.inviteId,
      },
      actions: [
        { action: "view", title: "View Invite" },
        { action: "dismiss", title: "Dismiss" },
      ],
    }
  );
}

// Example: Trigger notification when someone comments on an event
export async function notifyEventComment(data: {
  eventId: string;
  eventName: string;
  commenterName: string;
  eventAttendeeIds: string[]; // All attendees except the commenter
}) {
  const template = NotificationTemplates.EVENT_COMMENT(
    data.eventName,
    data.commenterName
  );

  const promises = data.eventAttendeeIds.map((userId) =>
    notifyUser(
      {
        userId,
        type: "EVENT_COMMENT",
        title: template.title,
        message: template.message,
        data: {
          type: "EVENT_COMMENT",
          eventId: data.eventId,
        },
      },
      {
        title: template.pushTitle,
        body: template.pushBody,
        data: {
          type: "EVENT_COMMENT",
          eventId: data.eventId,
        },
        actions: [{ action: "view", title: "View Event" }],
      }
    )
  );

  await Promise.all(promises);
}

export async function notifyCommentReply(data: {
  parentCommentUserId: string;
  replierId: string;
  replierName: string;
  eventId: string;
  eventName: string;
  commentId: string;
}) {
  // Don't notify if replying to own comment
  if (data.parentCommentUserId === data.replierId) {
    return;
  }

  const template = NotificationTemplates.COMMENT_REPLY(
    data.replierName,
    data.eventName
  );

  await notifyUser(
    {
      userId: data.parentCommentUserId,
      type: "COMMENT_REPLY",
      title: template.title,
      message: template.message,
      data: {
        type: "COMMENT_REPLY",
        eventId: data.eventId,
        commentId: data.commentId,
      },
    },
    {
      title: template.pushTitle,
      body: template.pushBody,
      data: {
        type: "COMMENT_REPLY",
        eventId: data.eventId,
        commentId: data.commentId,
      },
      actions: [{ action: "view", title: "View Comment" }],
    }
  );
}

export async function notifyCommentReaction(data: {
  commentUserId: string;
  reactorId: string;
  reactorName: string;
  eventId: string;
  eventName: string;
  commentId: string;
  emoji: string;
}) {
  // Don't notify if reacting to own comment
  if (data.commentUserId === data.reactorId) {
    return;
  }

  const template = NotificationTemplates.COMMENT_REACTION(
    data.reactorName,
    data.eventName,
    data.emoji
  );

  await notifyUser(
    {
      userId: data.commentUserId,
      type: "COMMENT_REACTION",
      title: template.title,
      message: template.message,
      data: {
        type: "COMMENT_REACTION",
        eventId: data.eventId,
        commentId: data.commentId,
      },
    },
    {
      title: template.pushTitle,
      body: template.pushBody,
      data: {
        type: "COMMENT_REACTION",
        eventId: data.eventId,
        commentId: data.commentId,
      },
      actions: [{ action: "view", title: "View Comment" }],
    }
  );
}

// Example: Trigger notification when someone posts a photo
export async function notifyEventPhoto(data: {
  eventId: string;
  eventName: string;
  photographerName: string;
  eventAttendeeIds: string[];
}) {
  const template = NotificationTemplates.EVENT_PHOTO(
    data.eventName,
    data.photographerName
  );

  const promises = data.eventAttendeeIds.map((userId) =>
    notifyUser(
      {
        userId,
        type: "EVENT_PHOTO",
        title: template.title,
        message: template.message,
        data: {
          type: "EVENT_PHOTO",
          eventId: data.eventId,
        },
      },
      {
        title: template.pushTitle,
        body: template.pushBody,
        data: {
          type: "EVENT_PHOTO",
          eventId: data.eventId,
        },
        actions: [{ action: "view", title: "View Photos" }],
      }
    )
  );

  await Promise.all(promises);
}

// Example: Trigger notification when someone creates an event
export async function notifyEventCreated(data: {
  eventId: string;
  eventName: string;
  creatorName: string;
  groupId?: string;
  groupName?: string;
  groupMemberIds: string[]; // Members to notify (excluding creator)
}) {
  const template = NotificationTemplates.EVENT_CREATED(
    data.eventName,
    data.creatorName,
    data.groupName
  );

  const promises = data.groupMemberIds.map((userId) =>
    notifyUser(
      {
        userId,
        type: "GROUP_EVENT_CREATED",
        title: template.title,
        message: template.message,
        data: {
          type: "GROUP_EVENT_CREATED",
          eventId: data.eventId,
          groupId: data.groupId,
        },
      },
      {
        title: template.pushTitle,
        body: template.pushBody,
        data: {
          type: "GROUP_EVENT_CREATED",
          eventId: data.eventId,
          groupId: data.groupId,
        },
        actions: [{ action: "view", title: "View Event" }],
      }
    )
  );

  await Promise.all(promises);
}

// Example: Trigger notification for RSVP updates (to event creator)
export async function notifyRSVPUpdate(data: {
  eventId: string;
  eventName: string;
  attendeeName: string;
  rsvpStatus: string;
  eventCreatorId: string;
}) {
  const template = NotificationTemplates.RSVP_UPDATE(
    data.attendeeName,
    data.eventName,
    data.rsvpStatus
  );

  await notifyUser(
    {
      userId: data.eventCreatorId,
      type: "RSVP_UPDATE",
      title: template.title,
      message: template.message,
      data: {
        type: "RSVP_UPDATE",
        eventId: data.eventId,
      },
    },
    {
      title: template.pushTitle,
      body: template.pushBody,
      data: {
        type: "RSVP_UPDATE",
        eventId: data.eventId,
      },
    }
  );
}

// Example: Event reminder notification (works with your existing cron job)
export async function sendEventReminder(data: {
  userId: string;
  eventId: string;
  eventName: string;
  timeUntil: string;
}) {
  const template = NotificationTemplates.EVENT_REMINDER(
    data.eventName,
    data.timeUntil
  );

  await notifyUser(
    {
      userId: data.userId,
      type: "EVENT_REMINDER",
      title: template.title,
      message: template.message,
      data: {
        type: "EVENT_REMINDER",
        eventId: data.eventId,
      },
    },
    {
      title: template.pushTitle,
      body: template.pushBody,
      data: {
        type: "EVENT_REMINDER",
        eventId: data.eventId,
      },
      actions: [
        { action: "view", title: "View Event" },
        { action: "dismiss", title: "Dismiss" },
      ],
    }
  );
}
