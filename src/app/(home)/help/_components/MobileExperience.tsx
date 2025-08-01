import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Download, Bell, Search, Settings } from "lucide-react";

export default function MobileExperience() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Mobile Experience</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Installing the App
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Visit kick-back.vercel.app on your mobile browser</li>
              <li>
                • <strong>iOS:</strong> Tap the Share button, then &quot;Add to
                Home Screen&quot;
              </li>
              <li>
                • <strong>Android:</strong> Tap &quot;Add to Home Screen&quot;
                when prompted
              </li>
              <li>• Works on iOS Safari and Android Chrome</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Push Notifications
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Enable push notifications for instant updates</li>
              <li>• Get notified about new events and RSVPs</li>
              <li>• Receive reminders even when the app is closed</li>
              <li>• Customize notification preferences</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Offline Access
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• View your events and groups offline</li>
              <li>• Changes sync when you&apos;re back online</li>
              <li>• Perfect for checking details on the go</li>
              <li>• No internet required for basic viewing</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mobile Settings
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Adjust text size for better readability</li>
              <li>• Enable haptic feedback for interactions</li>
              <li>• Optimize for your device&apos;s performance</li>
              <li>• Save data with low-bandwidth mode</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
