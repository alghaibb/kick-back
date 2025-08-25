"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUserEventTemplatesAction,
  getEventTemplateAction
} from "@/app/(main)/events/templates/actions";

export function useEventTemplates() {
  return useQuery({
    queryKey: ["event-templates"],
    queryFn: async () => {
      const result = await getUserEventTemplatesAction();
      if (result?.error) {
        throw new Error(result.error);
      }
      return result.templates || [];
    },
  });
}

export function useEventTemplate(templateId: string) {
  return useQuery({
    queryKey: ["event-template", templateId],
    queryFn: async () => {
      const result = await getEventTemplateAction(templateId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result.template;
    },
    enabled: !!templateId,
  });
}
