"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date-utils";
import {
  ArrowLeft,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  User,
  Loader2,
  Reply,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useAdminContacts,
  useDeleteContact,
} from "@/hooks/queries/useAdminContacts";
import { AdminContactsSkeleton } from "./AdminContactsSkeleton";
import { useModal } from "@/hooks/use-modal";
import { ContactReplyModal } from "./ContactReplyModal";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  subject: string;
  message: string;
  userId: string | null;
  createdAt: string;
  repliedAt?: string | null;
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
  const { open } = useModal();

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContactMutation.mutateAsync({ contactId });
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleReplyToContact = (contact: Contact) => {
    open("contact-reply", {
      contactId: contact.id,
      contactEmail: contact.email,
      contactSubject: contact.subject,
      contactMessage: contact.message,
    });
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
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-8 md:mb-10">
          <Button
            asChild
            variant="ghost"
            className="mb-4 md:mb-6 hover:bg-primary/5 transition-colors"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
                  <div className="relative h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-6 w-6 md:h-7 md:w-7 text-blue-foreground" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Contact Messages
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground/90 mt-1">
                    View and manage user contact form submissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Contacts List */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative z-10">
          <CardHeader className="border-b border-border/50 bg-card/50 pb-6 pt-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">Contact Messages</span>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {totalContacts} {totalContacts === 1 ? "message" : "messages"}
                </Badge>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Each message shows the sender&apos;s name, email, subject, and
              full message content.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {contacts.map((contact: Contact) => (
                <div
                  key={contact.id}
                  className="p-6 md:p-8 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 md:gap-6 flex-1">
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
                        {/* Header with name, email, and user status */}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-base md:text-lg text-foreground">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          {contact.user && (
                            <Badge variant="secondary" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Registered User
                            </Badge>
                          )}
                          {contact.repliedAt && (
                            <Badge
                              variant="default"
                              className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Replied
                            </Badge>
                          )}
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Email:
                            </span>{" "}
                            {contact.email}
                          </p>
                        </div>

                        {/* Subject */}
                        <div className="mb-3">
                          <h4 className="font-semibold text-base text-foreground mb-1">
                            Subject: {contact.subject}
                          </h4>
                        </div>

                        {/* Message */}
                        <div className="mb-3">
                          <p className="text-sm font-medium text-foreground mb-2">
                            Message:
                          </p>
                          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {contact.message}
                            </p>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex items-center gap-4">
                          <p className="text-xs text-muted-foreground">
                            Sent on{" "}
                            {formatDate(contact.createdAt, {
                              includeTime: true,
                              format: "default",
                              locale: "en-GB",
                            })}
                          </p>
                          {contact.repliedAt && (
                            <p className="text-xs text-green-600">
                              Replied on{" "}
                              {formatDate(contact.repliedAt, {
                                includeTime: true,
                                format: "default",
                                locale: "en-GB",
                              })}
                            </p>
                          )}
                        </div>
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
                          onClick={() => handleReplyToContact(contact)}
                          disabled={!!contact.repliedAt}
                        >
                          <Reply className="mr-2 h-4 w-4" />
                          {contact.repliedAt ? "Already Replied" : "Reply"}
                        </DropdownMenuItem>
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
        </div>
      </div>

      {/* Contact Reply Modal */}
      <ContactReplyModal />
    </div>
  );
}
