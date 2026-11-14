import { z } from "zod";

const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"), "Use HTTPS URLs.");
const bankTransferSchema = z.object({
  bankName: z.string().min(1).refine((value) => !/\[.*placeholder.*\]/i.test(value), "Use a verified bank name."),
  accountName: z.string().min(1).refine((value) => !/\[.*placeholder.*\]/i.test(value), "Use a verified account name."),
  iban: z.string().min(15).refine((value) => {
    const normalized = value.replace(/\s/g, "").toUpperCase();
    return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized) && !/^IE00/.test(normalized);
  }, "Use a verified IBAN."),
  bic: z.string().min(8).refine((value) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value) && !/^BANKIE/.test(value), "Use a verified BIC."),
});
const actionHref = z.string().refine(
  (value) =>
    (value.startsWith("/") && !value.startsWith("//") && !value.includes("#")) ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("https://"),
  "Actions must use a site route, mailto, tel or HTTPS URL.",
);

export const siteConfigSchema = z.object({
  organizationName: z.literal("Shuhada Foundation of Ireland"),
  masjidName: z.literal("Shaheed Bilal Masjid (Islamic Cultural and Education Centre)"),
  legalCharityName: z.literal("Irish Islamic Da'awah and Education Trust"),
  charitiesRegulatorNumber: z.literal("20069506"),
  revenueCharityTaxNumber: z.literal("CHY. 18219"),
  address: z.object({
    street: z.literal("Warrenstown House"),
    locality: z.literal("Blanchardstown"),
    city: z.literal("Dublin 15"),
    eircode: z.literal("D15 ET27"),
    country: z.literal("Ireland"),
    formatted: z.literal("Warrenstown House, Blanchardstown, Dublin 15, D15 ET27, Ireland"),
  }),
  coordinates: z.object({
    latitude: z.literal(53.385),
    longitude: z.literal(-6.386),
  }),
  timezone: z.literal("Europe/Dublin"),
  phone: z.literal("+353 1 821 8748"),
  displayPhone: z.literal("01 821 8748"),
  email: z.literal("info@shuhadafoundation.com"),
  domains: z.object({
    primary: z.literal("https://shuhadafoundation.com"),
    secondaryRedirect: z.literal("https://shuhadafoundation.ch"),
  }),
  sisterSchools: z.array(
    z.object({
      name: z.string().min(1),
      url: httpsUrl,
    }),
  ).length(2),
  description: z.string().min(20),
});

const clockTime = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format.");

export const prayerConfigSchema = z.object({
  latitude: z.literal(53.385),
  longitude: z.literal(-6.386),
  timezone: z.literal("Europe/Dublin"),
  aladhanMethod: z.number().int().min(0).max(99),
  asrDefault: z.enum(["standard", "hanafi"]),
  iqamahOffsetsConfirmed: z.boolean(),
  iqamahOffsetsMinutes: z.object({
    fajr: z.number().int().min(0).max(180),
    dhuhr: z.number().int().min(0).max(180),
    asr: z.number().int().min(0).max(180),
    maghrib: z.number().int().min(0).max(180),
    isha: z.number().int().min(0).max(180),
  }),
  jummah: z.array(z.object({
    name: z.string().min(1),
    khutbah: clockTime,
    iqamah: clockTime,
  })).length(2),
});

export const announcementsSchema = z.object({
  announcements: z.array(z.object({
    id: z.string().min(1),
    message: z.string().min(1).max(240),
    href: actionHref.optional(),
    active: z.boolean(),
  })),
});

export const campaignsSchema = z.object({
  campaign: z.object({
    title: z.string().min(1),
    eyebrow: z.string().min(1),
    description: z.string().min(1),
    hadith: z.object({
      text: z.string().min(1),
      source: z.string().min(1),
    }),
    milestones: z.array(z.object({
      title: z.string().min(1),
      status: z.enum(["unpublished", "planned", "inProgress", "complete"]),
    })).min(1),
  }),
});

export const servicesSchema = z.object({
  services: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    details: z.string().min(1),
    icon: z.enum(["moon", "book", "users", "heart", "school"]),
    actionLabel: z.string().min(1),
    actionHref,
  })).min(1),
});

const eventSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase event slug."),
  title: z.string().min(1),
  description: z.string().min(1),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }).optional(),
  location: z.string().min(1),
  url: httpsUrl.optional(),
});

export const eventsSchema = z.object({
  events: z.array(eventSchema),
  programmes: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })),
});

export const mediaSchema = z.object({
  videos: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
    kind: z.enum(["qiraat", "nasheed", "talk"]),
  })),
});

export const donationsSchema = z.object({
  bankTransferEnabled: z.boolean(),
  onlineDonationEnabled: z.boolean(),
  whatsappCommunityEnabled: z.boolean(),
  bankTransfer: bankTransferSchema.nullable(),
  onlineDonationUrl: httpsUrl.nullable(),
  whatsappUrl: z.string().url()
    .refine((value) => value.startsWith("https://wa.me/"), "Use an approved WhatsApp URL.")
    .refine((value) => !/35380{8}/.test(value), "Use a verified WhatsApp number.")
    .nullable(),
  fallbackEmail: z.literal("info@shuhadafoundation.com"),
  fallbackPhone: z.literal("+35318218748"),
}).superRefine((value, context) => {
  if (value.bankTransferEnabled && !value.bankTransfer) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["bankTransfer"], message: "Verified bank details are required when bank transfer is enabled." });
  }
  if (!value.bankTransferEnabled && value.bankTransfer) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["bankTransfer"], message: "Remove bank details while bank transfer is disabled." });
  }
  if (value.onlineDonationEnabled && !value.onlineDonationUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["onlineDonationUrl"], message: "A verified donation URL is required when online donations are enabled." });
  }
  if (!value.onlineDonationEnabled && value.onlineDonationUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["onlineDonationUrl"], message: "Remove the donation URL while online donations are disabled." });
  }
  if (value.whatsappCommunityEnabled && !value.whatsappUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["whatsappUrl"], message: "A verified WhatsApp URL is required when the community link is enabled." });
  }
  if (!value.whatsappCommunityEnabled && value.whatsappUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["whatsappUrl"], message: "Remove the WhatsApp URL while the community link is disabled." });
  }
});

export const contentSchemas = {
  "site-config": siteConfigSchema,
  "prayer-config": prayerConfigSchema,
  announcements: announcementsSchema,
  campaigns: campaignsSchema,
  services: servicesSchema,
  events: eventsSchema,
  media: mediaSchema,
  donations: donationsSchema,
};

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type PrayerConfig = z.infer<typeof prayerConfigSchema>;
export type Announcement = z.infer<typeof announcementsSchema>["announcements"][number];
export type Campaign = z.infer<typeof campaignsSchema>["campaign"];
export type Service = z.infer<typeof servicesSchema>["services"][number];
export type EventEntry = z.infer<typeof eventSchema>;
export type MediaVideo = z.infer<typeof mediaSchema>["videos"][number];
export type DonationConfig = z.infer<typeof donationsSchema>;
