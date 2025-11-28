const formatFriendlyDate = (d, timeZone = "UTC") => {
  const date = new Date(d);
  if (isNaN(date)) throw new Error("Invalid date value");

  const parts = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone
  }).formatToParts(date)) {
    parts[p.type] = p.value;
  }

  const day = Number(parts.day);

  const ordinal = n => {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return "th";
    return ["th", "st", "nd", "rd"][n % 10] || "th";
  };

  return `${day}${ordinal(day)} ${parts.month}, ${parts.year} (${parts.weekday})`;
};

export { formatFriendlyDate };
