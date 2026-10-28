/**
 * Single source of truth for business facts shown across the site.
 * Rating/review count mirror the Google Business listing — update both here
 * (and the JSON-LD block in index.html) when they change.
 */

export const BUSINESS = {
  name: "Biryani Darbaar",
  phoneDisplay: "+61 460 747 490",
  phoneHref: "tel:+61460747490",
  street: "183 Hanson Rd",
  suburb: "Athol Park SA 5012",
  rating: 4.5,
  reviewCount: 1068,
  googleReviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Biryani%20Darbaar%2C%20183%20Hanson%20Rd%2C%20Athol%20Park%20SA%205012",
  minOrder: 25,
  deliveryEta: "20–25 min",
  timeZone: "Australia/Adelaide",
} as const;

type DayHours = { day: string; open: string | null; close: string | null };

/** Same hours for dine-in, pickup and delivery. Sunday-first to match Date#getDay. */
export const HOURS: DayHours[] = [
  { day: "Sunday",    open: "11:00", close: "22:00" },
  { day: "Monday",    open: null,    close: null },
  { day: "Tuesday",   open: "11:00", close: "22:00" },
  { day: "Wednesday", open: "11:00", close: "22:00" },
  { day: "Thursday",  open: "11:00", close: "22:00" },
  { day: "Friday",    open: "11:00", close: "22:00" },
  { day: "Saturday",  open: "11:00", close: "22:00" },
];

/** Monday-first, the way people read a week. */
export const HOURS_WEEK = [...HOURS.slice(1), HOURS[0]];

/** "22:00" → "10 pm", "11:30" → "11:30 am" */
export const formatTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
};

export const formatRange = (d: DayHours): string =>
  d.open && d.close ? `${formatTime(d.open)} – ${formatTime(d.close)}` : "Closed";

/** Weekday name in Adelaide, regardless of the visitor's own time zone. */
export const adelaideWeekday = (date = new Date()): string =>
  new Intl.DateTimeFormat("en-AU", { weekday: "long", timeZone: BUSINESS.timeZone }).format(date);

/** e.g. "Open today 11 am – 10 pm" / "Closed today · Opens Tuesday 11 am" */
export const todayHoursLabel = (date = new Date()): string => {
  const idx = HOURS.findIndex((d) => d.day === adelaideWeekday(date));
  const today = HOURS[idx];
  if (today?.open) return `Open today ${formatRange(today)}`;
  const next = [1, 2, 3, 4, 5, 6].map((n) => HOURS[(idx + n) % 7]).find((d) => d.open);
  return next ? `Closed today · Opens ${next.day} ${formatTime(next.open!)}` : "Closed today";
};

export const reviewCountLabel = `${BUSINESS.reviewCount.toLocaleString("en-AU")} Google reviews`;
