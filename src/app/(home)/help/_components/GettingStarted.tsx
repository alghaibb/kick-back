import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, UserPlus } from "lucide-react";

export default function GettingStarted() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Getting Started</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Creating Your First Event
            </h3>
            <p className="text-muted-foreground mb-3">
              You can create events in two ways:
            </p>
            <ol className="text-muted-foreground space-y-2 ml-6">
              <li>
                1. <strong>Dashboard:</strong> Use the &quot;Create New
                Event&quot; quick action button
              </li>
              <li>
                2. <strong>Events Page:</strong> Go to the Events section and
                click &quot;Create Event&quot;
              </li>
              <li>
                3. Fill in your event details (name, date, time, location)
              </li>
              <li>4. Add a description and any special instructions</li>
              <li>5. Choose your group or create a new one</li>
              <li>6. Click &quot;Create Event&quot; to save</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Creating a Group
            </h3>
            <p className="text-muted-foreground mb-3">
              You can create groups in two ways:
            </p>
            <ol className="text-muted-foreground space-y-2 ml-6">
              <li>
                1. <strong>Dashboard:</strong> Use the &quot;Create Group&quot;
                quick action button
              </li>
              <li>
                2. <strong>Groups Page:</strong> Go to the Groups section and
                click &quot;Create Group&quot;
              </li>
              <li>3. Enter a group name and description</li>
              <li>4. Click &quot;Create Group&quot; to save</li>
              <li>
                5. The group management modal will open automatically for
                inviting members
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Inviting People
            </h3>
            <p className="text-muted-foreground mb-3">
              There are several ways to invite people to your events and groups:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>
                • <strong>Group Events:</strong> Automatically invite all group
                members
              </li>
              <li>
                • <strong>Group Invites:</strong> Invite people to join your
                group by email
              </li>
              <li>
                • <strong>Group Management:</strong> Use the invite management
                modal to see who&apos;s accepted, declined, or pending
              </li>
              <li>
                • <strong>Resend Invites:</strong> Resend invitations to those
                who haven&apos;t responded
              </li>
              <li>
                • <strong>Cancel Invites:</strong> Cancel pending invitations if
                needed
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
