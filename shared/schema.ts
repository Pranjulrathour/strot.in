import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["MAIN_ADMIN", "COMMUNITY_HEAD", "BUSINESS", "DONOR"]);
export const donationStatusEnum = pgEnum("donation_status", ["pending", "claimed", "delivered"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "filled", "closed"]);
export const workerStatusEnum = pgEnum("worker_status", ["available", "placed", "inactive"]);
export const workshopStatusEnum = pgEnum("workshop_status", ["proposed", "approved", "completed", "rejected"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "selected", "rejected"]);
export const commissionStatusEnum = pgEnum("commission_status", ["pending", "paid"]);
export const chStatusEnum = pgEnum("ch_status", ["pending", "active", "expired", "suspended"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: userRoleEnum("role").notNull().default("DONOR"),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityHeads = pgTable("community_heads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  locality: text("locality").notNull(),
  tenureStart: timestamp("tenure_start"),
  tenureEnd: timestamp("tenure_end"),
  performanceScore: integer("performance_score").default(0),
  status: chStatusEnum("status").notNull().default("pending"),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").notNull().references(() => users.id),
  communityHeadId: varchar("community_head_id").references(() => communityHeads.id),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(1),
  description: text("description"),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  locality: text("locality"),
  status: donationStatusEnum("status").notNull().default("pending"),
  proofImage: text("proof_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  claimedAt: timestamp("claimed_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const donationRequests = pgTable("donation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityHeadId: varchar("community_head_id").notNull().references(() => communityHeads.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  urgency: text("urgency").default("normal"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  requiredSkill: text("required_skill").notNull(),
  salaryRange: text("salary_range"),
  location: text("location").notNull(),
  status: jobStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workerProfiles = pgTable("worker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityHeadId: varchar("community_head_id").notNull().references(() => communityHeads.id),
  name: text("name").notNull(),
  age: integer("age"),
  skill: text("skill").notNull(),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`),
  experience: text("experience"),
  status: workerStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  workerId: varchar("worker_id").notNull().references(() => workerProfiles.id),
  status: applicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placements = pgTable("placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  workerId: varchar("worker_id").notNull().references(() => workerProfiles.id),
  businessConfirmation: text("business_confirmation").default("pending"),
  commissionStatus: commissionStatusEnum("commission_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workshops = pgTable("workshops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  communityHeadId: varchar("community_head_id").references(() => communityHeads.id),
  topic: text("topic").notNull(),
  description: text("description"),
  scheduleDate: timestamp("schedule_date"),
  location: text("location"),
  maxAttendees: integer("max_attendees"),
  status: workshopStatusEnum("status").notNull().default("proposed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  communityHead: one(communityHeads, {
    fields: [users.id],
    references: [communityHeads.userId],
  }),
  donations: many(donations),
  jobs: many(jobs),
  workshops: many(workshops),
}));

export const communityHeadsRelations = relations(communityHeads, ({ one, many }) => ({
  user: one(users, {
    fields: [communityHeads.userId],
    references: [users.id],
  }),
  donations: many(donations),
  donationRequests: many(donationRequests),
  workerProfiles: many(workerProfiles),
  workshops: many(workshops),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(users, {
    fields: [donations.donorId],
    references: [users.id],
  }),
  communityHead: one(communityHeads, {
    fields: [donations.communityHeadId],
    references: [communityHeads.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  business: one(users, {
    fields: [jobs.businessId],
    references: [users.id],
  }),
  applications: many(applications),
  placements: many(placements),
}));

export const workerProfilesRelations = relations(workerProfiles, ({ one, many }) => ({
  communityHead: one(communityHeads, {
    fields: [workerProfiles.communityHeadId],
    references: [communityHeads.id],
  }),
  applications: many(applications),
  placements: many(placements),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  worker: one(workerProfiles, {
    fields: [applications.workerId],
    references: [workerProfiles.id],
  }),
}));

export const placementsRelations = relations(placements, ({ one }) => ({
  job: one(jobs, {
    fields: [placements.jobId],
    references: [jobs.id],
  }),
  worker: one(workerProfiles, {
    fields: [placements.workerId],
    references: [workerProfiles.id],
  }),
}));

export const workshopsRelations = relations(workshops, ({ one }) => ({
  creator: one(users, {
    fields: [workshops.creatorId],
    references: [users.id],
  }),
  communityHead: one(communityHeads, {
    fields: [workshops.communityHeadId],
    references: [communityHeads.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCommunityHeadSchema = createInsertSchema(communityHeads).omit({ id: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true, claimedAt: true, deliveredAt: true });
export const insertDonationRequestSchema = createInsertSchema(donationRequests).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertWorkerProfileSchema = createInsertSchema(workerProfiles).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export const insertPlacementSchema = createInsertSchema(placements).omit({ id: true, createdAt: true });
export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCommunityHead = z.infer<typeof insertCommunityHeadSchema>;
export type CommunityHead = typeof communityHeads.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonationRequest = z.infer<typeof insertDonationRequestSchema>;
export type DonationRequest = typeof donationRequests.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;
export type WorkerProfile = typeof workerProfiles.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertPlacement = z.infer<typeof insertPlacementSchema>;
export type Placement = typeof placements.$inferSelect;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshops.$inferSelect;
