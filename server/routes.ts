import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import {
  insertUserSchema, insertDonationSchema, insertJobSchema,
  insertWorkerProfileSchema, insertWorkshopSchema, insertApplicationSchema,
  insertCommunityHeadSchema, insertDonationRequestSchema, insertPlacementSchema
} from "@shared/schema";
import { z } from "zod";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "strot-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({ checkPeriod: 86400000 }),
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const registerSchema = insertUserSchema.extend({
        locality: z.string().optional(),
      });
      const data = registerSchema.parse(req.body);

      const existing = await storage.getUserByPhone(data.phone);
      if (existing) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      if (data.role === "COMMUNITY_HEAD" && data.locality) {
        await storage.createCommunityHead({
          userId: user.id,
          locality: data.locality,
          status: "pending",
        });
      }

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/donations", requireAuth, async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.get("/api/donations/pending", requireAuth, async (req, res) => {
    try {
      const donations = await storage.getPendingDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending donations" });
    }
  });

  app.get("/api/donations/my", requireAuth, async (req, res) => {
    try {
      const donations = await storage.getDonationsByDonor(req.session.userId!);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your donations" });
    }
  });

  app.get("/api/donations/ch", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(404).json({ message: "Community head profile not found" });
      }
      const donations = await storage.getDonationsByCommunityHead(ch.id);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claimed donations" });
    }
  });

  app.post("/api/donations", requireAuth, async (req, res) => {
    try {
      const donationData = {
        donorId: req.session.userId!,
        itemName: req.body.itemName,
        category: req.body.category,
        quantity: req.body.quantity || 1,
        description: req.body.description || null,
        images: req.body.images || [],
        locality: req.body.locality || null,
        status: "pending" as const,
      };
      const data = insertDonationSchema.parse(donationData);
      const donation = await storage.createDonation(data);
      res.json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create donation" });
    }
  });

  app.patch("/api/donations/:id/claim", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(403).json({ message: "Only community heads can claim donations" });
      }
      const donation = await storage.claimDonation(req.params.id, ch.id);
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim donation" });
    }
  });

  app.patch("/api/donations/:id/deliver", requireAuth, async (req, res) => {
    try {
      const { proofImage } = req.body;
      const donation = await storage.deliverDonation(req.params.id, proofImage);
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark donation as delivered" });
    }
  });

  app.get("/api/donation-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getAllDonationRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation requests" });
    }
  });

  app.get("/api/donation-requests/ch", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(404).json({ message: "Community head profile not found" });
      }
      const requests = await storage.getDonationRequestsByCH(ch.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation requests" });
    }
  });

  app.post("/api/donation-requests", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(403).json({ message: "Only community heads can create donation requests" });
      }
      const requestData = {
        communityHeadId: ch.id,
        title: req.body.title,
        description: req.body.description || null,
        category: req.body.category,
        urgency: req.body.urgency || "normal",
        status: "open",
      };
      const data = insertDonationRequestSchema.parse(requestData);
      const request = await storage.createDonationRequest(data);
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create donation request" });
    }
  });

  app.get("/api/jobs", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/open", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getOpenJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch open jobs" });
    }
  });

  app.get("/api/jobs/my", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getJobsByBusiness(req.session.userId!);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your jobs" });
    }
  });

  app.post("/api/jobs", requireAuth, async (req, res) => {
    try {
      const jobData = {
        businessId: req.session.userId!,
        title: req.body.title,
        description: req.body.description || null,
        requiredSkill: req.body.requiredSkill,
        salaryRange: req.body.salaryRange || null,
        location: req.body.location,
        status: "open" as const,
      };
      const data = insertJobSchema.parse(jobData);
      const job = await storage.createJob(data);
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["open", "filled", "closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const job = await storage.updateJobStatus(req.params.id, status);
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.get("/api/workers", requireAuth, async (req, res) => {
    try {
      const workers = await storage.getAllWorkers();
      res.json(workers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workers" });
    }
  });

  app.get("/api/workers/ch", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(404).json({ message: "Community head profile not found" });
      }
      const workers = await storage.getWorkersByCommunityHead(ch.id);
      res.json(workers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workers" });
    }
  });

  app.post("/api/workers", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(403).json({ message: "Only community heads can add workers" });
      }
      const workerData = {
        communityHeadId: ch.id,
        name: req.body.name,
        age: req.body.age || null,
        skill: req.body.skill,
        photos: req.body.photos || [],
        experience: req.body.experience || null,
        status: "available" as const,
      };
      const data = insertWorkerProfileSchema.parse(workerData);
      const worker = await storage.createWorker(data);
      res.json(worker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to add worker" });
    }
  });

  app.patch("/api/workers/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["available", "placed", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const worker = await storage.updateWorkerStatus(req.params.id, status);
      res.json(worker);
    } catch (error) {
      res.status(500).json({ message: "Failed to update worker" });
    }
  });

  app.get("/api/applications/job/:jobId", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getApplicationsByJob(req.params.jobId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const appData = {
        jobId: req.body.jobId,
        workerId: req.body.workerId,
        status: "pending" as const,
      };
      const data = insertApplicationSchema.parse(appData);
      const application = await storage.createApplication(data);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "selected", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const application = await storage.updateApplicationStatus(req.params.id, status);
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.get("/api/placements", requireAuth, async (req, res) => {
    try {
      const placements = await storage.getAllPlacements();
      res.json(placements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch placements" });
    }
  });

  app.get("/api/placements/job/:jobId", requireAuth, async (req, res) => {
    try {
      const placements = await storage.getPlacementsByJob(req.params.jobId);
      res.json(placements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch placements" });
    }
  });

  app.post("/api/placements", requireAuth, async (req, res) => {
    try {
      const placementData = {
        jobId: req.body.jobId,
        workerId: req.body.workerId,
        businessConfirmation: "pending",
        commissionStatus: "pending" as const,
      };
      const data = insertPlacementSchema.parse(placementData);
      const placement = await storage.createPlacement(data);
      await storage.updateWorkerStatus(req.body.workerId, "placed");
      res.json(placement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create placement" });
    }
  });

  app.patch("/api/placements/:id/confirm", requireAuth, async (req, res) => {
    try {
      const placement = await storage.confirmPlacement(req.params.id);
      res.json(placement);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm placement" });
    }
  });

  app.get("/api/workshops", requireAuth, async (req, res) => {
    try {
      const workshops = await storage.getAllWorkshops();
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workshops" });
    }
  });

  app.get("/api/workshops/ch", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(404).json({ message: "Community head profile not found" });
      }
      const workshops = await storage.getWorkshopsByCommunityHead(ch.id);
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workshops" });
    }
  });

  app.get("/api/workshops/my", requireAuth, async (req, res) => {
    try {
      const workshops = await storage.getWorkshopsByCreator(req.session.userId!);
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your workshops" });
    }
  });

  app.post("/api/workshops", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      const workshopData = {
        creatorId: req.session.userId!,
        communityHeadId: ch?.id || null,
        topic: req.body.topic,
        description: req.body.description || null,
        scheduleDate: req.body.scheduleDate ? new Date(req.body.scheduleDate) : null,
        location: req.body.location || null,
        maxAttendees: req.body.maxAttendees || null,
        status: "proposed" as const,
      };
      const data = insertWorkshopSchema.parse(workshopData);
      const workshop = await storage.createWorkshop(data);
      res.json(workshop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create workshop" });
    }
  });

  app.patch("/api/workshops/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["proposed", "approved", "completed", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const workshop = await storage.updateWorkshopStatus(req.params.id, status);
      res.json(workshop);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workshop" });
    }
  });

  app.get("/api/community-heads", requireAuth, async (req, res) => {
    try {
      const chs = await storage.getAllCommunityHeads();
      res.json(chs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community heads" });
    }
  });

  app.get("/api/community-heads/me", requireAuth, async (req, res) => {
    try {
      const ch = await storage.getCommunityHeadByUserId(req.session.userId!);
      if (!ch) {
        return res.status(404).json({ message: "Community head profile not found" });
      }
      res.json(ch);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/community-heads/:id/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "MAIN_ADMIN") {
        return res.status(403).json({ message: "Only admins can update community head status" });
      }
      const { status } = req.body;
      if (!["pending", "active", "expired", "suspended"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const ch = await storage.updateCommunityHeadStatus(req.params.id, status);
      res.json(ch);
    } catch (error) {
      res.status(500).json({ message: "Failed to update community head" });
    }
  });

  app.get("/api/stats/admin", requireAuth, async (req, res) => {
    try {
      const [donations, jobs, workshops, chs] = await Promise.all([
        storage.getAllDonations(),
        storage.getAllJobs(),
        storage.getAllWorkshops(),
        storage.getAllCommunityHeads(),
      ]);
      res.json({
        totalDonations: donations.length,
        deliveredDonations: donations.filter(d => d.status === "delivered").length,
        totalJobs: jobs.length,
        openJobs: jobs.filter(j => j.status === "open").length,
        totalWorkshops: workshops.length,
        activeCommunityHeads: chs.filter(c => c.status === "active").length,
        pendingCommunityHeads: chs.filter(c => c.status === "pending").length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
