export const formatDate = (
  date: Date | string,
  options: {
    includeWeekday?: boolean;
    includeTime?: boolean;
    weekdayFormat?: "short" | "long" | "narrow";
    timeZone?: string;
    locale?: string;
    format?: "short" | "long" | "default";
  } = {}
) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const {
    includeWeekday = false,
    includeTime = false,
    weekdayFormat = "short",
    timeZone,
    locale = "en-US",
    format = "default",
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {};

  // Set format based on preference
  if (format === "short") {
    formatOptions.year = "2-digit";
    formatOptions.month = "numeric";
    formatOptions.day = "numeric";
  } else if (format === "long") {
    formatOptions.year = "numeric";
    formatOptions.month = "long";
    formatOptions.day = "numeric";
  } else {
    // default format
    formatOptions.year = "numeric";
    formatOptions.month = "short";
    formatOptions.day = "numeric";
  }

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
