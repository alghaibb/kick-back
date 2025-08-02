import { Card, CardContent } from "@/components/ui/card";
import { Image, Upload, Download } from "lucide-react";

export default function PhotoSharing() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Image className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-semibold">Photo Sharing</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Uploading Photos
            </h3>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Drag and drop photos directly into the event gallery</li>
              <li>• Supported formats: JPG, PNG, WebP, GIF</li>
              <li>• File size limits vary by type:</li>
              <li className="ml-4">- Event photos: 10MB</li>
              <li className="ml-4">- Comment photos: 5MB</li>
              <li className="ml-4">- Group images: 4MB</li>
              <li className="ml-4">- Profile pictures: 2MB</li>
              <li>• Photos are automatically optimized for web viewing</li>
              <li>• Add captions to your photos for context</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Viewing Photos
            </h3>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Click any photo to view it in full size</li>
              <li>• Use the gallery view to browse all event photos</li>
              <li>• Photos are organized by upload date</li>
              <li>• View photos shared by all event attendees</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-medium mb-2 text-blue-900 dark:text-blue-100">
              Privacy & Sharing
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Only event attendees can view and upload photos</li>
              <li>• Photos are private to your event group</li>
              <li>• You can delete your own photos anytime</li>
              <li>• Event creators can moderate the photo gallery</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
