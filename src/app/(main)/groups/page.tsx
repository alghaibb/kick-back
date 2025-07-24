import { Users } from "lucide-react";
import { Suspense } from "react";
import { CreateActionButton } from "../_components/CreateActionButton";
import { PageHeader } from "../_components/PageHeader";
import { GroupsClientNew } from "./_components/GroupsClientNew";
import { GroupsSkeleton } from "./_components/GroupsSkeleton";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Users className="h-6 w-6 text-primary" />}
        title="Groups"
        subtitle="Manage and create groups for your events or collaborations. Organize your community and streamline event planning."
        action={
          <CreateActionButton modalType="create-group" label="Create Group" />
        }
      />

      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsClientNew />
      </Suspense>
    </div>
  );
}
