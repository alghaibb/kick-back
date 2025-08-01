"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  ArrowLeft,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  useAdminContacts,
  useDeleteContact,
} from "@/hooks/queries/useAdminContacts";
import { AdminContactsSkeleton } from "./AdminContactsSkeleton";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  subject: string;
  message: string;
  userId: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image?: string | null;
  } | null;
}

export function AdminContactsClient() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminContacts();

  const deleteContactMutation = useDeleteContact();

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContactMutation.mutateAsync({ contactId });
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return (firstName[0] || "" + (lastName?.[0] || "")).toUpperCase();
  };

  if (isLoading) {
    return <AdminContactsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load contacts</p>
      </div>
    );
  }

  const contacts = data?.pages.flatMap((page) => page.contacts) || [];
  const totalContacts = data?.pages[0]?.pagination.total || 0;

  return (
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button asChild variant="ghost" className="mb-3 md:mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Contact Messages</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage contact form submissions.
          </p>
        </div>

        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Messages ({totalContacts})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {contacts.map((contact: Contact) => (
                <div key={contact.id} className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12">
                        <AvatarImage
                          src={contact.user?.image ?? undefined}
                          alt="Profile"
                        />
                        <AvatarFallback>
                          {getInitials(contact.firstName, contact.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm md:text-base">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          {contact.user && (
                            <Badge variant="secondary" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Registered User
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {contact.email}
                        </p>
                        <h4 className="font-medium text-sm md:text-base mb-2">
                          {contact.subject}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {contact.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(
                            new Date(contact.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="p-4 md:p-6 border-t border-border">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
