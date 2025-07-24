import { Users } from "lucide-react";
import { Suspense } from "react";
import { CreateActionButton } from "../_components/CreateActionButton";
import { PageHeader } from "../_components/PageHeader";
import { GroupsClientNew } from "./_components/GroupsClientNew";
import { GroupsSkeleton } from "./_components/GroupsSkeleton";

export default function Page() {
  return (
    <div className="container py-8">
      <PageHeader
        icon={<Users className="h-6 w-6" />}
        title="Groups"
        subtitle="Manage and create groups for your events or collaborations."
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
