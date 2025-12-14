import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import {
  insertUserSchema, insertDonationSchema, insertJobSchema,
  insertWorkerProfileSchema, insertWorkshopSchema, insertApplicationSchema,
  insertCommunityHeadSchema
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
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

      const hashedPassword = await hashPassword(password);
      if (user.password !== hashedPassword) {
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
      const data = insertDonationSchema.parse({
        ...req.body,
        donorId: req.session.userId,
      });
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
      const donation = await storage.updateDonation(req.params.id, {
        communityHeadId: ch.id,
        status: "claimed",
        claimedAt: new Date(),
      });
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim donation" });
    }
  });

  app.patch("/api/donations/:id/deliver", requireAuth, async (req, res) => {
    try {
      const { proofImage } = req.body;
      const donation = await storage.updateDonation(req.params.id, {
        status: "delivered",
        deliveredAt: new Date(),
        proofImage,
      });
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark donation as delivered" });
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
      const data = insertJobSchema.parse({
        ...req.body,
        businessId: req.session.userId,
      });
      const job = await storage.createJob(data);
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
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
      const data = insertWorkerProfileSchema.parse({
        ...req.body,
        communityHeadId: ch.id,
      });
      const worker = await storage.createWorker(data);
      res.json(worker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to add worker" });
    }
  });

  app.patch("/api/workers/:id", requireAuth, async (req, res) => {
    try {
      const worker = await storage.updateWorker(req.params.id, req.body);
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
      const data = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(data);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.updateApplication(req.params.id, req.body);
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
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
      const data = insertWorkshopSchema.parse({
        ...req.body,
        creatorId: req.session.userId,
        communityHeadId: ch?.id,
      });
      const workshop = await storage.createWorkshop(data);
      res.json(workshop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create workshop" });
    }
  });

  app.patch("/api/workshops/:id", requireAuth, async (req, res) => {
    try {
      const workshop = await storage.updateWorkshop(req.params.id, req.body);
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

  app.patch("/api/community-heads/:id", requireAuth, async (req, res) => {
    try {
      const ch = await storage.updateCommunityHead(req.params.id, req.body);
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
