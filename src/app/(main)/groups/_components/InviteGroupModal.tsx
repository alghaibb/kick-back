"use client";

import { useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/use-modal";
import { InviteGroupForm } from "../forms/InviteGroupForm";
import { GroupInviteManager } from "./GroupInviteManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Users } from "lucide-react";

export function InviteGroupModal() {
  const { type, isOpen, close, data } = useModal();
  const [activeTab, setActiveTab] = useState("invite");

  if (type !== "invite-group" || !data?.groupId || !data?.groupName)
    return null;

  const isAdmin = data?.userRole === "admin" || data?.userRole === "owner";

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="max-w-2xl flex flex-col">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            Invite to {data.groupName}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Send invitations to new members
            {isAdmin ? " and manage existing ones" : ""}.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Invite
            </TabsTrigger>

            <TabsTrigger
              value="manage"
              className="flex items-center gap-2"
              disabled={!isAdmin}
            >
              <Users className="h-4 w-4" />
              Manage Invites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="mt-6">
            <InviteGroupForm
              groupId={data.groupId}
              groupName={data.groupName}
              onSuccess={() => isAdmin && setActiveTab("manage")}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="manage" className="mt-6">
              <GroupInviteManager
                groupId={data.groupId}
                groupName={data.groupName}
              />
            </TabsContent>
          )}
        </Tabs>

        <ResponsiveModalFooter>
          <Button variant="outline" onClick={close}>
            Close
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
