export const formatDate = (
  date: Date | string,
  options: {
    includeWeekday?: boolean;
    includeTime?: boolean;
    weekdayFormat?: "short" | "long" | "narrow";
    timeZone?: string;
    locale?: string;
  } = {}
) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const {
    includeWeekday = false,
    includeTime = false,
    weekdayFormat = "short",
    timeZone, // Remove default UTC timezone
    locale = "en-US"
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  // Only set timeZone if explicitly provided
  if (timeZone) {
    formatOptions.timeZone = timeZone;
  }

  if (includeWeekday) {
    formatOptions.weekday = weekdayFormat;
  }

  if (includeTime) {
    formatOptions.hour = "numeric";
    formatOptions.minute = "2-digit";
    formatOptions.hour12 = true;
  }

  return dateObj.toLocaleString(locale, formatOptions);
};