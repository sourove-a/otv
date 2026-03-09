import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const bgRemoveRateLimit = new Map<string, number[]>();
const BG_REMOVE_MAX_REQUESTS = 5;
const BG_REMOVE_WINDOW_MS = 60 * 1000;

function checkBgRemoveRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (bgRemoveRateLimit.get(ip) || []).filter(t => now - t < BG_REMOVE_WINDOW_MS);
  if (timestamps.length >= BG_REMOVE_MAX_REQUESTS) return false;
  timestamps.push(now);
  bgRemoveRateLimit.set(ip, timestamps);
  return true;
}

async function getCanvaAccessToken(): Promise<string> {
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("CANVA_CLIENT_ID and CANVA_CLIENT_SECRET must be set");
  }
  const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "asset:read asset:write design:content:read design:content:write",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canva auth failed (${res.status}): ${text}`);
  }
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/remove-bg", upload.single("image"), async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      if (!checkBgRemoveRateLimit(clientIp)) {
        return res.status(429).json({ error: "Rate limit exceeded. Max 5 requests per minute." });
      }

      let imageBuffer: Buffer;
      let mimeType = "image/png";

      if (req.file) {
        imageBuffer = req.file.buffer;
        mimeType = req.file.mimetype;
      } else if (req.body?.image) {
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, "base64");
        const match = req.body.image.match(/^data:(image\/\w+);base64,/);
        if (match) mimeType = match[1];
      } else {
        return res.status(400).json({ error: "No image provided" });
      }

      const accessToken = await getCanvaAccessToken();

      const uploadRes = await fetch("https://api.canva.com/rest/v1/asset-uploads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": mimeType,
          "Asset-Upload-Metadata": JSON.stringify({
            name_base64: Buffer.from(`bg-remove-${Date.now()}`).toString("base64"),
          }),
        },
        body: imageBuffer,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        return res.status(502).json({ error: `Canva upload failed: ${text}` });
      }

      const uploadData = await uploadRes.json() as { job: { id: string; status: string } };
      const jobId = uploadData.job?.id;

      if (!jobId) {
        return res.status(502).json({ error: "Canva upload did not return a job ID" });
      }

      let assetId: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`https://api.canva.com/rest/v1/asset-uploads/${jobId}`, {
          headers: { "Authorization": `Bearer ${accessToken}` },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json() as { job: { status: string; asset?: { id: string } } };
          if (statusData.job?.status === "success" && statusData.job?.asset?.id) {
            assetId = statusData.job.asset.id;
            break;
          } else if (statusData.job?.status === "failed") {
            return res.status(502).json({ error: "Canva asset upload failed" });
          }
        }
      }

      if (!assetId) {
        return res.status(504).json({ error: "Canva upload timed out" });
      }

      const editRes = await fetch("https://api.canva.com/rest/v1/image/edit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset_id: assetId,
          operations: [{ type: "background_remove" }],
          output: { format: "png" },
        }),
      });

      if (!editRes.ok) {
        const text = await editRes.text();
        return res.status(502).json({ error: `Canva edit failed: ${text}` });
      }

      const editData = await editRes.json() as { job: { id: string } };
      const editJobId = editData.job?.id;

      if (!editJobId) {
        return res.status(502).json({ error: "Canva edit did not return a job ID" });
      }

      let resultUrl: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`https://api.canva.com/rest/v1/image/edit/${editJobId}`, {
          headers: { "Authorization": `Bearer ${accessToken}` },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json() as { job: { status: string; result?: { url: string } } };
          if (statusData.job?.status === "success" && statusData.job?.result?.url) {
            resultUrl = statusData.job.result.url;
            break;
          } else if (statusData.job?.status === "failed") {
            return res.status(502).json({ error: "Canva background removal failed" });
          }
        }
      }

      if (!resultUrl) {
        return res.status(504).json({ error: "Canva background removal timed out" });
      }

      const imageRes = await fetch(resultUrl);
      if (!imageRes.ok) {
        return res.status(502).json({ error: "Failed to download processed image" });
      }

      const processedBuffer = Buffer.from(await imageRes.arrayBuffer());
      const base64Result = `data:image/png;base64,${processedBuffer.toString("base64")}`;

      return res.json({ image: base64Result });
    } catch (err: any) {
      console.error("Background removal error:", err);
      return res.status(500).json({ error: err.message || "Background removal failed" });
    }
  });

  return httpServer;
}
