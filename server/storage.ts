import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, communityHeads, donations, donationRequests, jobs,
  workerProfiles, applications, placements, workshops,
  type User, type InsertUser,
  type CommunityHead, type InsertCommunityHead,
  type Donation, type InsertDonation,
  type DonationRequest, type InsertDonationRequest,
  type Job, type InsertJob,
  type WorkerProfile, type InsertWorkerProfile,
  type Application, type InsertApplication,
  type Placement, type InsertPlacement,
  type Workshop, type InsertWorkshop,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCommunityHead(id: string): Promise<CommunityHead | undefined>;
  getCommunityHeadByUserId(userId: string): Promise<CommunityHead | undefined>;
  getAllCommunityHeads(): Promise<CommunityHead[]>;
  createCommunityHead(ch: InsertCommunityHead): Promise<CommunityHead>;
  updateCommunityHead(id: string, data: Partial<CommunityHead>): Promise<CommunityHead | undefined>;

  getAllDonations(): Promise<Donation[]>;
  getDonationsByDonor(donorId: string): Promise<Donation[]>;
  getDonationsByCommunityHead(chId: string): Promise<Donation[]>;
  getPendingDonations(): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: string, data: Partial<Donation>): Promise<Donation | undefined>;

  createDonationRequest(request: InsertDonationRequest): Promise<DonationRequest>;
  getDonationRequestsByCH(chId: string): Promise<DonationRequest[]>;

  getAllJobs(): Promise<Job[]>;
  getJobsByBusiness(businessId: string): Promise<Job[]>;
  getOpenJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, data: Partial<Job>): Promise<Job | undefined>;

  getWorkersByCommunityHead(chId: string): Promise<WorkerProfile[]>;
  getAllWorkers(): Promise<WorkerProfile[]>;
  getWorker(id: string): Promise<WorkerProfile | undefined>;
  createWorker(worker: InsertWorkerProfile): Promise<WorkerProfile>;
  updateWorker(id: string, data: Partial<WorkerProfile>): Promise<WorkerProfile | undefined>;

  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationsByWorker(workerId: string): Promise<Application[]>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: string, data: Partial<Application>): Promise<Application | undefined>;

  createPlacement(placement: InsertPlacement): Promise<Placement>;
  getPlacementsByJob(jobId: string): Promise<Placement[]>;

  getAllWorkshops(): Promise<Workshop[]>;
  getWorkshopsByCommunityHead(chId: string): Promise<Workshop[]>;
  getWorkshopsByCreator(creatorId: string): Promise<Workshop[]>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: string, data: Partial<Workshop>): Promise<Workshop | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getCommunityHead(id: string): Promise<CommunityHead | undefined> {
    const [ch] = await db.select().from(communityHeads).where(eq(communityHeads.id, id));
    return ch;
  }

  async getCommunityHeadByUserId(userId: string): Promise<CommunityHead | undefined> {
    const [ch] = await db.select().from(communityHeads).where(eq(communityHeads.userId, userId));
    return ch;
  }

  async getAllCommunityHeads(): Promise<CommunityHead[]> {
    return db.select().from(communityHeads).orderBy(desc(communityHeads.performanceScore));
  }

  async createCommunityHead(ch: InsertCommunityHead): Promise<CommunityHead> {
    const [created] = await db.insert(communityHeads).values(ch).returning();
    return created;
  }

  async updateCommunityHead(id: string, data: Partial<CommunityHead>): Promise<CommunityHead | undefined> {
    const [updated] = await db.update(communityHeads).set(data).where(eq(communityHeads.id, id)).returning();
    return updated;
  }

  async getAllDonations(): Promise<Donation[]> {
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    return db.select().from(donations).where(eq(donations.donorId, donorId)).orderBy(desc(donations.createdAt));
  }

  async getDonationsByCommunityHead(chId: string): Promise<Donation[]> {
    return db.select().from(donations).where(eq(donations.communityHeadId, chId)).orderBy(desc(donations.createdAt));
  }

  async getPendingDonations(): Promise<Donation[]> {
    return db.select().from(donations).where(eq(donations.status, "pending")).orderBy(desc(donations.createdAt));
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [created] = await db.insert(donations).values(donation).returning();
    return created;
  }

  async updateDonation(id: string, data: Partial<Donation>): Promise<Donation | undefined> {
    const [updated] = await db.update(donations).set(data).where(eq(donations.id, id)).returning();
    return updated;
  }

  async createDonationRequest(request: InsertDonationRequest): Promise<DonationRequest> {
    const [created] = await db.insert(donationRequests).values(request).returning();
    return created;
  }

  async getDonationRequestsByCH(chId: string): Promise<DonationRequest[]> {
    return db.select().from(donationRequests).where(eq(donationRequests.communityHeadId, chId)).orderBy(desc(donationRequests.createdAt));
  }

  async getAllJobs(): Promise<Job[]> {
    return db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJobsByBusiness(businessId: string): Promise<Job[]> {
    return db.select().from(jobs).where(eq(jobs.businessId, businessId)).orderBy(desc(jobs.createdAt));
  }

  async getOpenJobs(): Promise<Job[]> {
    return db.select().from(jobs).where(eq(jobs.status, "open")).orderBy(desc(jobs.createdAt));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job | undefined> {
    const [updated] = await db.update(jobs).set(data).where(eq(jobs.id, id)).returning();
    return updated;
  }

  async getWorkersByCommunityHead(chId: string): Promise<WorkerProfile[]> {
    return db.select().from(workerProfiles).where(eq(workerProfiles.communityHeadId, chId)).orderBy(desc(workerProfiles.createdAt));
  }

  async getAllWorkers(): Promise<WorkerProfile[]> {
    return db.select().from(workerProfiles).orderBy(desc(workerProfiles.createdAt));
  }

  async getWorker(id: string): Promise<WorkerProfile | undefined> {
    const [worker] = await db.select().from(workerProfiles).where(eq(workerProfiles.id, id));
    return worker;
  }

  async createWorker(worker: InsertWorkerProfile): Promise<WorkerProfile> {
    const [created] = await db.insert(workerProfiles).values(worker).returning();
    return created;
  }

  async updateWorker(id: string, data: Partial<WorkerProfile>): Promise<WorkerProfile | undefined> {
    const [updated] = await db.update(workerProfiles).set(data).where(eq(workerProfiles.id, id)).returning();
    return updated;
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.createdAt));
  }

  async getApplicationsByWorker(workerId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.workerId, workerId)).orderBy(desc(applications.createdAt));
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [created] = await db.insert(applications).values(app).returning();
    return created;
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application | undefined> {
    const [updated] = await db.update(applications).set(data).where(eq(applications.id, id)).returning();
    return updated;
  }

  async createPlacement(placement: InsertPlacement): Promise<Placement> {
    const [created] = await db.insert(placements).values(placement).returning();
    return created;
  }

  async getPlacementsByJob(jobId: string): Promise<Placement[]> {
    return db.select().from(placements).where(eq(placements.jobId, jobId)).orderBy(desc(placements.createdAt));
  }

  async getAllWorkshops(): Promise<Workshop[]> {
    return db.select().from(workshops).orderBy(desc(workshops.createdAt));
  }

  async getWorkshopsByCommunityHead(chId: string): Promise<Workshop[]> {
    return db.select().from(workshops).where(eq(workshops.communityHeadId, chId)).orderBy(desc(workshops.createdAt));
  }

  async getWorkshopsByCreator(creatorId: string): Promise<Workshop[]> {
    return db.select().from(workshops).where(eq(workshops.creatorId, creatorId)).orderBy(desc(workshops.createdAt));
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const [created] = await db.insert(workshops).values(workshop).returning();
    return created;
  }

  async updateWorkshop(id: string, data: Partial<Workshop>): Promise<Workshop | undefined> {
    const [updated] = await db.update(workshops).set(data).where(eq(workshops.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
