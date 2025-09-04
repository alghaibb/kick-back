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

  if (format === "short") {
    formatOptions.year = "2-digit";
    formatOptions.month = "numeric";
    formatOptions.day = "numeric";
  } else if (format === "long") {
    formatOptions.year = "numeric";
    formatOptions.month = "long";
    formatOptions.day = "numeric";
  } else {
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

export const formatTime = (
  time: string,
  options: {
    format?: "12" | "24";
    locale?: string;
  } = {}
) => {
  const { format = "12", locale = "en-US" } = options;

  if (!time || !time.includes(":")) return time;

  const [hoursStr, minutes] = time.split(":");
  const hours = parseInt(hoursStr, 10);

  if (isNaN(hours)) return time;

  // Create a date object with the time
  const date = new Date();
  date.setHours(hours, parseInt(minutes, 10), 0, 0);

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: format === "12",
  };

  return date.toLocaleTimeString(locale, formatOptions);
};
