import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (url.startsWith("/api/")) {
    const res = await supabaseApiRequest(method, url, data);
    await throwIfResNotOk(res);
    return res;
  }
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>({ on401: unauthorizedBehavior }: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    if (url.startsWith("/api/")) {
      return (await supabaseQuery(url)) as unknown as T;
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

async function supabaseQuery(url: string): Promise<unknown> {
  if (url === "/api/donations/pending") {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDonation);
  }

  if (url === "/api/donations/ch") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data: ch } = await supabase
      .from("community_heads")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!ch) return [];
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("community_head_id", ch.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDonation);
  }

  if (url === "/api/donations/my") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("donor_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDonation);
  }

  if (url === "/api/jobs") {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapJob);
  }

  if (url === "/api/jobs/my") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("business_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapJob);
  }

  if (url === "/api/workshops") {
    const { data, error } = await supabase.from("workshops").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWorkshop);
  }

  if (url === "/api/workshops/ch") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data: ch } = await supabase
      .from("community_heads")
      .select("id, locality")
      .eq("user_id", userId)
      .maybeSingle();
    if (!ch) return [];
    // Show all workshops: assigned to this CH, or any unassigned proposed workshops.
    // This ensures CH always sees new proposals even without locality matching.
    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .or(`community_head_id.eq.${ch.id},community_head_id.is.null`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWorkshop);
  }

  // Get all pending workshop proposals for CH to review
  if (url === "/api/workshops/proposals") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data: ch } = await supabase
      .from("community_heads")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    // Show all proposed workshops: assigned to this CH or unassigned (community_head_id is null)
    const { data, error } = await supabase
      .from("workshops")
      .select(`
        *,
        creator:profiles!workshops_creator_id_fkey(id, name, phone, email)
      `)
      .eq("status", "proposed")
      .or(ch ? `community_head_id.eq.${ch.id},community_head_id.is.null` : "community_head_id.is.null")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(row => ({
      ...mapWorkshop(row),
      creator: row.creator ? {
        id: row.creator.id,
        name: row.creator.name,
        phone: row.creator.phone,
        email: row.creator.email
      } : null
    }));
  }

  // Get user's own workshop proposals
  if (url === "/api/workshops/my") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWorkshop);
  }

  if (url === "/api/community-heads/me") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) return null;
    
    const { data } = await supabase
      .from("community_heads")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (!data) return null;
    return mapCommunityHead(data);
  }

  if (url === "/api/workers/ch") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data: ch } = await supabase
      .from("community_heads")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (!ch) return [];
    
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("community_head_id", ch.id)
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWorker);
  }

  if (url === "/api/applications/business") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    
    // Get all jobs for this business
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("business_id", userId);
      
    if (!jobs?.length) return [];
    
    const jobIds = jobs.map(j => j.id);
    
    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        worker:worker_profiles(*),
        job:jobs(*)
      `)
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return (data ?? []).map(row => ({
      ...mapApplication(row),
      worker: row.worker ? mapWorker(row.worker) : undefined,
      job: row.job ? mapJob(row.job) : undefined
    }));
  }

  if (url === "/api/donations") {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDonation);
  }

  if (url === "/api/community-heads") {
    const { data, error } = await supabase
      .from("community_heads")
      .select("*")
      .order("performance_score", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  // CH: Get applications made by this CH's workers
  if (url === "/api/applications/ch") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data: ch } = await supabase
      .from("community_heads")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!ch) return [];

    const { data: workers } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("community_head_id", ch.id);
    
    if (!workers?.length) return [];
    const workerIds = workers.map(w => w.id);

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        worker:worker_profiles(*),
        job:jobs(*)
      `)
      .in("worker_id", workerIds)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(row => ({
      ...mapApplication(row),
      worker: row.worker ? mapWorker(row.worker) : undefined,
      job: row.job ? mapJob(row.job) : undefined
    }));
  }

  // CH: Get jobs that match their workers' skills
  if (url === "/api/jobs/matching") {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    const { data: ch } = await supabase
      .from("community_heads")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!ch) return [];

    const { data: workers } = await supabase
      .from("worker_profiles")
      .select("skill")
      .eq("community_head_id", ch.id)
      .eq("status", "available");
    
    const skills = Array.from(new Set(workers?.map(w => w.skill) || []));
    
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    
    // Mark jobs that match available worker skills
    return (data ?? []).map(job => ({
      ...mapJob(job),
      hasMatchingWorker: skills.includes(job.required_skill)
    }));
  }

  return [];
};

function mapDonation(row: any) {
  return {
    id: row.id,
    donorId: row.donor_id,
    communityHeadId: row.community_head_id,
    itemName: row.item_name,
    category: row.category,
    quantity: row.quantity,
    description: row.description,
    images: row.images,
    phone: row.phone,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    locality: row.locality,
    status: row.status,
    proofImage: row.proof_image,
    createdAt: row.created_at,
    claimedAt: row.claimed_at,
    deliveredAt: row.delivered_at,
  };
}

function mapJob(row: any) {
  return {
    id: row.id,
    businessId: row.business_id,
    title: row.title,
    description: row.description,
    requiredSkill: row.required_skill,
    salaryRange: row.salary_range,
    phone: row.phone,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapWorkshop(row: any) {
  return {
    id: row.id,
    creatorId: row.creator_id,
    communityHeadId: row.community_head_id,
    topic: row.topic,
    description: row.description,
    phone: row.phone,
    scheduleDate: row.schedule_date,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    maxAttendees: row.max_attendees,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapCommunityHead(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    locality: row.locality,
    tenureStart: row.tenure_start,
    tenureEnd: row.tenure_end,
    performanceScore: row.performance_score,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapWorker(row: any) {
  return {
    id: row.id,
    communityHeadId: row.community_head_id,
    name: row.name,
    phone: row.phone,
    age: row.age,
    skill: row.skill,
    photos: row.photos,
    experience: row.experience,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapApplication(row: any) {
  return {
    id: row.id,
    jobId: row.job_id,
    workerId: row.worker_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function supabaseApiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  try {
    if (method === "POST" && url === "/api/workers") {
      const body = data as any;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      const { data: ch } = await supabase
        .from("community_heads")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      // Permanent resilience: legacy COMMUNITY_HEAD users may be missing a row in community_heads.
      // Attempt to auto-create their row so worker creation doesn't hard-fail.
      let chId = ch?.id;
      if (!chId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.role === "COMMUNITY_HEAD") {
          const { data: profileWithLocality } = await supabase
            .from("profiles")
            .select("locality")
            .eq("id", userId)
            .maybeSingle();

          const { data: createdCh, error: createChErr } = await supabase
            .from("community_heads")
            .insert({
              user_id: userId,
              locality: (profileWithLocality as any)?.locality ?? "Not specified",
              status: "pending",
            })
            .select("id")
            .maybeSingle();

          if (createChErr) return jsonResponse({ message: createChErr.message }, 400);
          chId = createdCh?.id;
        }
      }

      if (!chId) return jsonResponse({ message: "Not a community head" }, 403);

      const { error } = await supabase.from("worker_profiles").insert({
        community_head_id: chId,
        name: body.name,
        phone: body.phone ?? null,
        age: body.age,
        skill: body.skill,
        experience: body.experience ?? null,
        photos: body.photos ?? [],
        location: body.location ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
      });
      
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    // CH: Apply a worker to a job (create application)
    if (method === "POST" && url === "/api/applications") {
      const body = data as any;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      // Verify CH owns this worker
      const { data: ch } = await supabase
        .from("community_heads")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!ch) return jsonResponse({ message: "Not a community head" }, 403);

      const { data: worker } = await supabase
        .from("worker_profiles")
        .select("id, community_head_id")
        .eq("id", body.workerId)
        .maybeSingle();
      
      if (!worker || worker.community_head_id !== ch.id) {
        return jsonResponse({ message: "Worker not found or not in your community" }, 403);
      }

      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", body.jobId)
        .eq("worker_id", body.workerId)
        .maybeSingle();
      
      if (existing) {
        return jsonResponse({ message: "Worker already applied to this job" }, 400);
      }

      const { error } = await supabase.from("applications").insert({
        job_id: body.jobId,
        worker_id: body.workerId,
        status: "pending",
      });
      
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "PATCH" && url.startsWith("/api/applications/")) {
      const id = url.split("/")[3];
      const body = data as any;
      const { error } = await supabase
        .from("applications")
        .update({ status: body.status })
        .eq("id", id);
        
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "PATCH" && url.startsWith("/api/community-heads/")) {
      const id = url.split("/")[3];
      const body = data as any;
      const { error } = await supabase
        .from("community_heads")
        .update({ status: body.status })
        .eq("id", id);
        
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "POST" && url === "/api/donations") {
      const body = data as any;
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user?.id;
      const { error } = await supabase.from("donations").insert({
        donor_id: userId,
        item_name: body.itemName,
        category: body.category,
        quantity: body.quantity,
        description: body.description ?? null,
        images: body.images ?? [],
        phone: body.phone ?? null,
        location: body.location ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
      });
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "PATCH" && url.endsWith("/claim")) {
      const id = url.split("/")[3];
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      const { data: ch } = await supabase
        .from("community_heads")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!ch) return jsonResponse({ message: "Not a community head" }, 403);
      const { error } = await supabase
        .from("donations")
        .update({ community_head_id: ch.id, status: "claimed", claimed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "PATCH" && url.endsWith("/deliver")) {
      const id = url.split("/")[3];
      const body = data as any;
      const { error } = await supabase
        .from("donations")
        .update({ status: "delivered", proof_image: body.proofImage ?? null, delivered_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "POST" && url === "/api/jobs") {
      const body = data as any;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      const { error } = await supabase.from("jobs").insert({
        business_id: userId,
        title: body.title,
        description: body.description ?? null,
        required_skill: body.requiredSkill,
        salary_range: body.salaryRange ?? null,
        phone: body.phone ?? null,
        location: body.location,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
      });
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    // BUSINESS: Update a job (used for closing jobs)
    if (method === "PATCH" && url.startsWith("/api/jobs/")) {
      const id = url.split("/")[3];
      const body = data as any;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      // Ensure the job belongs to the current business user
      const { data: job, error: jobErr } = await supabase
        .from("jobs")
        .select("id, business_id")
        .eq("id", id)
        .maybeSingle();
      if (jobErr) return jsonResponse({ message: jobErr.message }, 400);
      if (!job || job.business_id !== userId) {
        return jsonResponse({ message: "Not allowed" }, 403);
      }

      const { error } = await supabase.from("jobs").update({ status: body.status }).eq("id", id);
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "POST" && url === "/api/workshops") {
      const body = data as any;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      // Try to associate the proposal to a Community Head using the submitted workshop location.
      // Note: profiles table does not contain a locality column in this project.
      const workshopLocality = typeof body.location === "string" ? body.location.trim() : "";
      const { data: targetCh } = workshopLocality
        ? await supabase
            .from("community_heads")
            .select("id")
            .ilike("locality", workshopLocality)
            .eq("status", "active")
            .maybeSingle()
        : { data: null };

      const { error } = await supabase.from("workshops").insert({
        creator_id: userId,
        topic: body.topic,
        description: body.description ?? null,
        phone: body.phone ?? null,
        location: body.location,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        schedule_date: body.scheduleDate ? new Date(body.scheduleDate).toISOString() : null,
        max_attendees: body.maxAttendees ?? null,
        status: "proposed",
        community_head_id: targetCh?.id ?? null,
      });
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    // CH approves or rejects a workshop proposal
    if (method === "PATCH" && url.startsWith("/api/workshops/") && url.endsWith("/review")) {
      const id = url.split("/")[3];
      const body = data as any;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      // Get CH id
      const { data: ch } = await supabase
        .from("community_heads")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!ch) return jsonResponse({ message: "Not a community head" }, 403);

      const updateData: any = { status: body.status };
      if (body.status === "approved") {
        updateData.community_head_id = ch.id;
        updateData.schedule_date = body.scheduleDate ? new Date(body.scheduleDate).toISOString() : null;
      }

      const { error } = await supabase
        .from("workshops")
        .update(updateData)
        .eq("id", id);
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    if (method === "PATCH" && url.startsWith("/api/workshops/")) {
      const id = url.split("/")[3];
      const body = data as any;
      const { error } = await supabase.from("workshops").update({ status: body.status }).eq("id", id);
      if (error) return jsonResponse({ message: error.message }, 400);
      return jsonResponse({ ok: true }, 200);
    }

    return jsonResponse({ message: `Not implemented: ${method} ${url}` }, 404);
  } catch (e) {
    return jsonResponse({ message: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
