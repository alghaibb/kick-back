import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Edit, Trash2, Bell, CheckCircle } from "lucide-react";

export default function ManagingEvents() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Managing Events</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editing Events
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Click the event to open details</li>
              <li>• Use the edit button to modify any information</li>
              <li>
                • Click &quot;Save Changes&quot; to save your modifications
              </li>
              <li>• All attendees receive update notifications</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Deleting Events
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Only event creators can delete events</li>
              <li>• Deleting sends notifications to all attendees</li>
              <li>• Deleted events are permanently removed</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders & Notifications
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Set custom reminder times for each event</li>
              <li>• Choose email, SMS, or push notifications</li>
              <li>• Reminders are sent automatically</li>
              <li>• Manage preferences in your settings</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              RSVP Management
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Track who&apos;s coming, maybe, or declined</li>
              <li>• View RSVP status for all attendees</li>
              <li>• See who hasn&apos;t responded yet</li>
              <li>• Manage responses through the event details</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
