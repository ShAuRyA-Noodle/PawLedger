import { pgTable, text, timestamp, integer, bigint, boolean, json, pgEnum, uuid, varchar, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const cuid = () => text("id").$defaultFn(() => createId()).primaryKey();
const ts = (name: string) => timestamp(name, { withTimezone: true });

// ─── Enums ────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["donor", "shelter_member", "shelter_admin", "platform_admin"]);
export const currencyEnum = pgEnum("currency", ["INR", "USD"]);
export const shelterEntityTypeEnum = pgEnum("shelter_entity_type", ["section_8_company", "trust", "society", "501c3", "fiscal_sponsored", "other"]);
export const kycStatusEnum = pgEnum("kyc_status", ["unsubmitted", "pending", "in_review", "verified", "rejected"]);
export const animalSpeciesEnum = pgEnum("animal_species", ["dog", "cat", "cow", "bird", "rabbit", "horse", "donkey", "other"]);
export const animalStatusEnum = pgEnum("animal_status", ["draft", "active", "fully_funded", "rehomed", "deceased", "archived"]);
export const animalSexEnum = pgEnum("animal_sex", ["male", "female", "unknown"]);
export const animalSizeEnum = pgEnum("animal_size", ["small", "medium", "large", "xl"]);
export const sponsorshipStatusEnum = pgEnum("sponsorship_status", ["active", "paused", "cancelled", "past_due", "incomplete"]);
export const donationKindEnum = pgEnum("donation_kind", ["one_time", "recurring", "sos", "csr", "in_kind"]);
export const donationStatusEnum = pgEnum("donation_status", ["pending", "succeeded", "failed", "refunded", "disputed"]);
export const ledgerKindEnum = pgEnum("ledger_kind", ["donation_in", "expense_out", "transfer", "fee", "refund", "in_kind_in"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["food", "medical", "vaccination", "surgery", "shelter_supplies", "transport", "wages", "facility", "platform_fee", "payment_fee", "other"]);
export const payoutStatusEnum = pgEnum("payout_status", ["queued", "processing", "paid", "failed", "held"]);
export const gatewayEnum = pgEnum("gateway", ["razorpay", "stripe", "cashfree", "manual"]);
export const sosStatusEnum = pgEnum("sos_status", ["reported", "claimed", "in_progress", "resolved", "unfound", "expired"]);
export const sosOutcomeEnum = pgEnum("sos_outcome", ["treated_and_released", "rehabilitated", "rehomed", "euthanized", "deceased", "no_found", "other"]);
export const updateKindEnum = pgEnum("update_kind", ["text", "photo", "video", "milestone", "vet_visit", "outcome"]);
export const complaintStatusEnum = pgEnum("complaint_status", ["open", "investigating", "resolved", "dismissed"]);
export const csrTierEnum = pgEnum("csr_tier", ["pilot", "growth", "enterprise"]);

// ─── Better Auth required tables (compatible) ─────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRoleEnum("role").default("donor").notNull(),
  phone: text("phone"),
  locale: varchar("locale", { length: 8 }).default("en").notNull(),
  preferredCurrency: currencyEnum("preferred_currency").default("INR").notNull(),
  marketingOptIn: boolean("marketing_opt_in").default(false).notNull(),
  city: text("city"),
  country: varchar("country", { length: 2 }).default("IN").notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
}, t => ({
  emailIdx: uniqueIndex("user_email_idx").on(t.email),
  roleIdx: index("user_role_idx").on(t.role),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: ts("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
}, t => ({ tokenIdx: uniqueIndex("session_token_idx").on(t.token) }));

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: ts("access_token_expires_at"),
  refreshTokenExpiresAt: ts("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: ts("expires_at").notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
});

// ─── Shelters ─────────────────────────────────────────────────────────

export const shelters = pgTable("shelters", {
  id: cuid(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  legalName: text("legal_name").notNull(),
  entityType: shelterEntityTypeEnum("entity_type").notNull(),
  founded: integer("founded"),
  about: text("about"),
  city: text("city").notNull(),
  state: text("state"),
  country: varchar("country", { length: 2 }).default("IN").notNull(),
  pincode: text("pincode"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  // Compliance
  pan: text("pan"),
  gstin: text("gstin"),
  ein: text("ein"),
  cin: text("cin"),
  registration12a: text("registration_12a"),
  registration80g: text("registration_80g"),
  registration80gExpiresAt: ts("registration_80g_expires_at"),
  csr1: text("csr_1"),
  awbiRecognition: text("awbi_recognition"),
  awbiRecognitionExpiresAt: ts("awbi_recognition_expires_at"),
  fcraStatus: text("fcra_status"),
  // KYC
  kycStatus: kycStatusEnum("kyc_status").default("unsubmitted").notNull(),
  kycProvider: text("kyc_provider"),
  kycReference: text("kyc_reference"),
  kycVerifiedAt: ts("kyc_verified_at"),
  // Payout
  razorpayLinkedAccountId: text("razorpay_linked_account_id"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  cashfreeBeneficiaryId: text("cashfree_beneficiary_id"),
  bankAccountLast4: text("bank_account_last4"),
  // Stats (denormalized)
  totalRaised: bigint("total_raised", { mode: "bigint" }).default(0n).notNull(), // smallest unit (paise / cents)
  animalsInCare: integer("animals_in_care").default(0).notNull(),
  trustScore: integer("trust_score").default(50).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  isVerifiedShelter: boolean("is_verified_shelter").default(false).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
}, t => ({
  slugIdx: uniqueIndex("shelters_slug_idx").on(t.slug),
  cityIdx: index("shelters_city_idx").on(t.city),
  publishedIdx: index("shelters_published_idx").on(t.isPublished),
}));

export const shelterMembers = pgTable("shelter_members", {
  id: cuid(),
  shelterId: text("shelter_id").notNull().references(() => shelters.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").default("shelter_member").notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({
  uniq: uniqueIndex("shelter_members_uniq").on(t.shelterId, t.userId),
}));

// ─── Animals ──────────────────────────────────────────────────────────

export const animals = pgTable("animals", {
  id: cuid(),
  slug: text("slug").notNull().unique(),
  shelterId: text("shelter_id").notNull().references(() => shelters.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: animalSpeciesEnum("species").notNull(),
  breed: text("breed"),
  sex: animalSexEnum("sex").default("unknown").notNull(),
  size: animalSizeEnum("size"),
  birthEstimate: ts("birth_estimate"),
  arrivedAt: ts("arrived_at").defaultNow().notNull(),
  rescueStory: text("rescue_story"),
  currentStory: text("current_story"),
  currentNeeds: text("current_needs"),
  status: animalStatusEnum("status").default("draft").notNull(),
  // Funding
  monthlyCostPaise: bigint("monthly_cost_paise", { mode: "bigint" }).default(0n).notNull(),
  goalFundedPaise: bigint("goal_funded_paise", { mode: "bigint" }).default(0n).notNull(), // total raised for this animal
  sponsorCount: integer("sponsor_count").default(0).notNull(),
  // Featured imagery
  heroPhotoUrl: text("hero_photo_url"),
  heroVideoUrl: text("hero_video_url"),
  // Geo
  city: text("city"),
  country: varchar("country", { length: 2 }).default("IN").notNull(),
  // Flags
  isUrgent: boolean("is_urgent").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: ts("published_at"),
  outcomePostedAt: ts("outcome_posted_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
}, t => ({
  slugIdx: uniqueIndex("animals_slug_idx").on(t.slug),
  shelterIdx: index("animals_shelter_idx").on(t.shelterId),
  statusIdx: index("animals_status_idx").on(t.status),
  publishedIdx: index("animals_published_idx").on(t.isPublished),
  urgentIdx: index("animals_urgent_idx").on(t.isUrgent),
}));

export const animalPhotos = pgTable("animal_photos", {
  id: cuid(),
  animalId: text("animal_id").notNull().references(() => animals.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  takenAt: ts("taken_at"),
  photographer: text("photographer"),
  ord: integer("ord").default(0).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({ animalIdx: index("animal_photos_animal_idx").on(t.animalId) }));

export const animalUpdates = pgTable("animal_updates", {
  id: cuid(),
  animalId: text("animal_id").notNull().references(() => animals.id, { onDelete: "cascade" }),
  authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
  kind: updateKindEnum("kind").default("text").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  mediaUrl: text("media_url"),
  publishedAt: ts("published_at").defaultNow().notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({ animalIdx: index("animal_updates_animal_idx").on(t.animalId) }));

export const vetRecords = pgTable("vet_records", {
  id: cuid(),
  animalId: text("animal_id").notNull().references(() => animals.id, { onDelete: "cascade" }),
  visitDate: ts("visit_date").notNull(),
  vetName: text("vet_name"),
  clinicName: text("clinic_name"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  weightKg: integer("weight_kg_x100"), // *100 to avoid float (e.g. 12.34kg = 1234)
  vaccinationsJson: json("vaccinations_json"),
  attachmentUrl: text("attachment_url"),
  costPaise: bigint("cost_paise", { mode: "bigint" }).default(0n).notNull(),
  ledgerEntryId: text("ledger_entry_id"),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({ animalIdx: index("vet_records_animal_idx").on(t.animalId) }));

// ─── Sponsorships (recurring) ─────────────────────────────────────────

export const sponsorships = pgTable("sponsorships", {
  id: cuid(),
  donorId: text("donor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  animalId: text("animal_id").references(() => animals.id, { onDelete: "set null" }),
  shelterId: text("shelter_id").notNull().references(() => shelters.id, { onDelete: "cascade" }),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(), // monthly amount in smallest unit
  currency: currencyEnum("currency").default("INR").notNull(),
  gateway: gatewayEnum("gateway").notNull(),
  gatewaySubscriptionId: text("gateway_subscription_id"),
  status: sponsorshipStatusEnum("status").default("active").notNull(),
  startedAt: ts("started_at").defaultNow().notNull(),
  pausedUntil: ts("paused_until"),
  cancelledAt: ts("cancelled_at"),
  nextChargeAt: ts("next_charge_at"),
  cardLast4: text("card_last4"),
  cardExpiresAt: ts("card_expires_at"),
  totalContributedPaise: bigint("total_contributed_paise", { mode: "bigint" }).default(0n).notNull(),
  monthsActive: integer("months_active").default(0).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
}, t => ({
  donorIdx: index("sponsorships_donor_idx").on(t.donorId),
  animalIdx: index("sponsorships_animal_idx").on(t.animalId),
  statusIdx: index("sponsorships_status_idx").on(t.status),
  gatewaySubIdx: uniqueIndex("sponsorships_gateway_sub_idx").on(t.gatewaySubscriptionId),
}));

// ─── Donations (every charge) ─────────────────────────────────────────

export const donations = pgTable("donations", {
  id: cuid(),
  donorId: text("donor_id").references(() => user.id, { onDelete: "set null" }),
  donorEmail: text("donor_email"), // for guest donations
  donorName: text("donor_name"),
  shelterId: text("shelter_id").references(() => shelters.id, { onDelete: "set null" }),
  animalId: text("animal_id").references(() => animals.id, { onDelete: "set null" }),
  sponsorshipId: text("sponsorship_id").references(() => sponsorships.id, { onDelete: "set null" }),
  sosReportId: text("sos_report_id"),
  csrAccountId: text("csr_account_id"),
  kind: donationKindEnum("kind").notNull(),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
  currency: currencyEnum("currency").default("INR").notNull(),
  // Fee breakdown (denormalized)
  platformFeePaise: bigint("platform_fee_paise", { mode: "bigint" }).default(0n).notNull(),
  paymentFeePaise: bigint("payment_fee_paise", { mode: "bigint" }).default(0n).notNull(),
  netToShelterPaise: bigint("net_to_shelter_paise", { mode: "bigint" }).default(0n).notNull(),
  donorCoveredFees: boolean("donor_covered_fees").default(false).notNull(),
  // Gateway
  gateway: gatewayEnum("gateway").notNull(),
  gatewayChargeId: text("gateway_charge_id"),
  gatewayOrderId: text("gateway_order_id"),
  status: donationStatusEnum("status").default("pending").notNull(),
  // Tax
  taxReceiptNumber: text("tax_receipt_number"),
  taxReceiptUrl: text("tax_receipt_url"),
  taxReceiptIssuedAt: ts("tax_receipt_issued_at"),
  // Meta
  utmJson: json("utm_json"),
  ipCountry: varchar("ip_country", { length: 2 }),
  capturedAt: ts("captured_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({
  donorIdx: index("donations_donor_idx").on(t.donorId),
  shelterIdx: index("donations_shelter_idx").on(t.shelterId),
  animalIdx: index("donations_animal_idx").on(t.animalId),
  statusIdx: index("donations_status_idx").on(t.status),
  capturedIdx: index("donations_captured_idx").on(t.capturedAt),
  gatewayChargeIdx: uniqueIndex("donations_gateway_charge_idx").on(t.gatewayChargeId),
}));

// ─── Append-only Ledger ───────────────────────────────────────────────

export const ledgerEntries = pgTable("ledger_entries", {
  id: cuid(),
  animalId: text("animal_id").references(() => animals.id, { onDelete: "set null" }),
  shelterId: text("shelter_id").notNull().references(() => shelters.id, { onDelete: "cascade" }),
  donationId: text("donation_id").references(() => donations.id, { onDelete: "set null" }),
  payoutId: text("payout_id"),
  kind: ledgerKindEnum("kind").notNull(),
  category: expenseCategoryEnum("category"),
  description: text("description").notNull(),
  vendor: text("vendor"),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(), // signed: positive in, negative out
  currency: currencyEnum("currency").default("INR").notNull(),
  proofUrl: text("proof_url"),
  occurredAt: ts("occurred_at").defaultNow().notNull(),
  // Hash chain (per shelter)
  prevHash: text("prev_hash"),
  hash: text("hash").notNull(),
  blockHeight: integer("block_height").notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({
  shelterIdx: index("ledger_shelter_idx").on(t.shelterId),
  animalIdx: index("ledger_animal_idx").on(t.animalId),
  hashIdx: uniqueIndex("ledger_hash_idx").on(t.shelterId, t.hash),
  blockIdx: uniqueIndex("ledger_block_idx").on(t.shelterId, t.blockHeight),
}));

// ─── Payouts ──────────────────────────────────────────────────────────

export const payouts = pgTable("payouts", {
  id: cuid(),
  shelterId: text("shelter_id").notNull().references(() => shelters.id, { onDelete: "cascade" }),
  gateway: gatewayEnum("gateway").notNull(),
  gatewayPayoutId: text("gateway_payout_id"),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
  currency: currencyEnum("currency").default("INR").notNull(),
  status: payoutStatusEnum("status").default("queued").notNull(),
  scheduledAt: ts("scheduled_at"),
  paidAt: ts("paid_at"),
  failureReason: text("failure_reason"),
  donationsCovered: integer("donations_covered").default(0).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
}, t => ({
  shelterIdx: index("payouts_shelter_idx").on(t.shelterId),
  statusIdx: index("payouts_status_idx").on(t.status),
}));

// ─── SOS Reports ──────────────────────────────────────────────────────

export const sosReports = pgTable("sos_reports", {
  id: cuid(),
  publicId: text("public_id").notNull().unique(),
  reporterUserId: text("reporter_user_id").references(() => user.id, { onDelete: "set null" }),
  reporterPhone: text("reporter_phone"),
  reporterName: text("reporter_name"),
  // Geo
  latitude: integer("latitude_e7").notNull(), // store as int (deg * 1e7)
  longitude: integer("longitude_e7").notNull(),
  city: text("city"),
  state: text("state"),
  country: varchar("country", { length: 2 }).default("IN").notNull(),
  addressNote: text("address_note"),
  // Animal
  species: animalSpeciesEnum("species").notNull(),
  conditionDescription: text("condition_description").notNull(),
  isInjured: boolean("is_injured").default(false).notNull(),
  isHitByVehicle: boolean("is_hit_by_vehicle").default(false).notNull(),
  isAggressive: boolean("is_aggressive").default(false).notNull(),
  photoUrl: text("photo_url"),
  // Dispatch
  status: sosStatusEnum("status").default("reported").notNull(),
  claimedByShelterId: text("claimed_by_shelter_id").references(() => shelters.id, { onDelete: "set null" }),
  claimedAt: ts("claimed_at"),
  slaDeadlineAt: ts("sla_deadline_at"),
  // Outcome
  outcome: sosOutcomeEnum("outcome"),
  outcomeNote: text("outcome_note"),
  outcomePhotoUrl: text("outcome_photo_url"),
  outcomePostedAt: ts("outcome_posted_at"),
  resultingAnimalId: text("resulting_animal_id").references(() => animals.id, { onDelete: "set null" }),
  // Funding
  microFundGoalPaise: bigint("micro_fund_goal_paise", { mode: "bigint" }).default(150000n).notNull(), // ₹1500 default
  microFundRaisedPaise: bigint("micro_fund_raised_paise", { mode: "bigint" }).default(0n).notNull(),
  donorCount: integer("donor_count").default(0).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({
  publicIdx: uniqueIndex("sos_public_idx").on(t.publicId),
  statusIdx: index("sos_status_idx").on(t.status),
  geoIdx: index("sos_geo_idx").on(t.latitude, t.longitude),
}));

// ─── CSR ──────────────────────────────────────────────────────────────

export const csrAccounts = pgTable("csr_accounts", {
  id: cuid(),
  companyName: text("company_name").notNull(),
  legalName: text("legal_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  pan: text("pan"),
  gstin: text("gstin"),
  cin: text("cin"),
  tier: csrTierEnum("tier").default("pilot").notNull(),
  annualPledgePaise: bigint("annual_pledge_paise", { mode: "bigint" }).default(0n).notNull(),
  pledgedAt: ts("pledged_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const csrGrants = pgTable("csr_grants", {
  id: cuid(),
  csrAccountId: text("csr_account_id").notNull().references(() => csrAccounts.id, { onDelete: "cascade" }),
  shelterId: text("shelter_id").notNull().references(() => shelters.id, { onDelete: "cascade" }),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
  currency: currencyEnum("currency").default("INR").notNull(),
  donationId: text("donation_id").references(() => donations.id, { onDelete: "set null" }),
  reportUrl: text("report_url"),
  csrFormUrl: text("csr_form_url"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

// ─── Complaints + Audit ───────────────────────────────────────────────

export const complaints = pgTable("complaints", {
  id: cuid(),
  reporterUserId: text("reporter_user_id").references(() => user.id, { onDelete: "set null" }),
  reporterEmail: text("reporter_email"),
  aboutType: text("about_type").notNull(), // shelter | animal | donation | sos | platform
  aboutId: text("about_id"),
  body: text("body").notNull(),
  status: complaintStatusEnum("status").default("open").notNull(),
  resolution: text("resolution"),
  resolvedAt: ts("resolved_at"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: cuid(),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  beforeJson: json("before_json"),
  afterJson: json("after_json"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({ entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId) }));

// ─── Gamification ─────────────────────────────────────────────────────

export const badges = pgTable("badges", {
  id: cuid(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  criteriaJson: json("criteria_json").notNull(),
});

export const earnedBadges = pgTable("earned_badges", {
  id: cuid(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: ts("earned_at").defaultNow().notNull(),
}, t => ({ uniq: uniqueIndex("earned_badges_uniq").on(t.userId, t.badgeId) }));

export const referralCodes = pgTable("referral_codes", {
  id: cuid(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  uses: integer("uses").default(0).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
});

// ─── Subscriptions to platform updates (newsletter) ──────────────────

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: cuid(),
  email: text("email").notNull().unique(),
  source: text("source"),
  confirmedAt: ts("confirmed_at"),
  unsubscribedAt: ts("unsubscribed_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
});

// ─── Sponsor messages (public on animal profile) ─────────────────────

export const sponsorMessages = pgTable("sponsor_messages", {
  id: cuid(),
  animalId: text("animal_id").notNull().references(() => animals.id, { onDelete: "cascade" }),
  authorUserId: text("author_user_id").references(() => user.id, { onDelete: "set null" }),
  authorName: text("author_name"),
  body: text("body").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
}, t => ({ animalIdx: index("sponsor_messages_animal_idx").on(t.animalId) }));
