"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Plus } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: "default" | "outline";
  icon: string;
  onClick?: () => void;
}

const iconMap = {
  Calendar,
  Users,
  Plus,
} as const;

export function QuickActionCard({
  title,
  description,
  buttonText,
  buttonVariant = "default",
  icon,
  onClick,
}: QuickActionCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-end">
        <Button variant={buttonVariant} className="w-full" onClick={onClick}>
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
