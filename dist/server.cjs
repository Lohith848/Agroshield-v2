var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_axios = __toESM(require("axios"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_sdk = require("@anthropic-ai/sdk");
var import_cors = __toESM(require("cors"), 1);
import_dotenv.default.config();
var requiredEnvVars = {
  GOVT_AGRI_API_KEY: process.env.GOVT_AGRI_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
};
var missingEnvVars = Object.entries(requiredEnvVars).filter(([_, value]) => !value).map(([key]) => key);
if (missingEnvVars.length > 0) {
  console.warn(`[Startup] Missing environment variables: ${missingEnvVars.join(", ")}`);
  console.warn("[Startup] Some features may be degraded until all required keys are set.");
} else {
  console.log("[Startup] All required environment variables loaded successfully.");
}
var anthropic = process.env.ANTHROPIC_API_KEY ? new import_sdk.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3000", 10);
if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
  app.set("trust proxy", 1);
}
app.use((0, import_cors.default)({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin"],
  maxAge: 86400
}));
app.options("*", (0, import_cors.default)());
app.use(import_express.default.json({ limit: "10mb" }));
app.get("/health", (_req, res) => {
  const fs = require("fs");
  const distPath = import_path.default.resolve(process.cwd(), "dist");
  const exists = fs.existsSync(distPath);
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    distPath,
    distExists: exists
  });
});
app.get("/", (_req, res) => {
  const distPath = import_path.default.resolve(process.cwd(), "dist", "index.html");
  if (require("fs").existsSync(distPath)) {
    res.sendFile(distPath);
  } else {
    res.status(500).json({ error: "index.html not found" });
  }
});
app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Weather API key missing" });
    }
    if (!lat || !lon) {
      return res.status(400).json({ error: "Coordinates required" });
    }
    const response = await import_axios.default.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: { lat, lon, appid: apiKey, units: "metric" },
        timeout: 6e3
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Weather API Error:", error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.response?.data?.message || "Failed to fetch weather"
    });
  }
});
app.get("/api/news", async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "News API key missing",
        setupInstructions: "Please set NEWS_API_KEY in environment variables."
      });
    }
    const response = await import_axios.default.get(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: "agriculture+farming+india",
          sortBy: "publishedAt",
          language: "en",
          apiKey,
          pageSize: 10
        },
        timeout: 6e3
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("News API Error:", error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.response?.data?.message || "Failed to fetch news"
    });
  }
});
app.get("/api/prices", async (req, res) => {
  try {
    const apiKey = process.env.GOVT_AGRI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Market API not configured",
        setupInstructions: "GOVT_AGRI_API_KEY missing in environment."
      });
    }
    const response = await import_axios.default.get(
      "https://api.data.gov.in/resource/9ef273e5-bf72-4aff-b5a8-20673033605b",
      {
        params: {
          "api-key": apiKey,
          format: "json",
          limit: 10
        },
        timeout: 7e3,
        headers: {
          "Accept": "application/json",
          "User-Agent": "AgroShieldApp/2.0"
        }
      }
    );
    const data = response.data;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid API response format");
    }
    const rawRecords = Array.isArray(data?.records) ? data.records : [];
    const records = rawRecords.map((item) => ({
      commodity: item.commodity || "Unknown Commodity",
      market: item.market || "Unknown Market",
      district: item.district || "Unknown District",
      state: item.state || "Unknown State",
      modal_price: String(item.modal_price || item.modalRate || item.modal_rate || "0"),
      arrival_date: item.arrival_date || item.arrivalDate || item.date || "N/A",
      variety: item.variety || "Common",
      min_price: String(item.min_price || item.minPrice || item.min_rate || "0"),
      max_price: String(item.max_price || item.maxPrice || item.max_rate || "0")
    }));
    if (records.length === 0) {
      console.log("[Market API] No records from API, using fallback data");
      throw new Error("No records available from API");
    }
    res.json({ records, isFallback: false });
  } catch (error) {
    console.error("Market API Error:", error.message);
    const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN");
    const fallbackRecords = [
      { commodity: "Tomato", market: "Azadpur", district: "Delhi", state: "Delhi", modal_price: "2400", arrival_date: today, variety: "Hybrid", min_price: "2000", max_price: "2800" },
      { commodity: "Potato", market: "Kolkata", district: "Kolkata", state: "West Bengal", modal_price: "1200", arrival_date: today, variety: "Desi", min_price: "1000", max_price: "1400" },
      { commodity: "Onion", market: "Lasalgaon", district: "Nashik", state: "Maharashtra", modal_price: "1850", arrival_date: today, variety: "Red", min_price: "1600", max_price: "2100" },
      { commodity: "Wheat", market: "Khanna", district: "Ludhiana", state: "Punjab", modal_price: "2275", arrival_date: today, variety: "Lok-1", min_price: "2100", max_price: "2450" }
    ];
    res.json({
      records: fallbackRecords,
      isFallback: true,
      message: "Live market data unavailable. Showing regional averages."
    });
  }
});
app.post("/api/claude-analyze", async (req, res) => {
  try {
    if (!anthropic) {
      return res.status(501).json({
        error: "Claude API not configured",
        setupInstructions: "ANTHROPIC_API_KEY missing. Add it to your environment variables."
      });
    }
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }
    const base64Data = image.split(",")[1];
    const mimeMatch = image.match(/data:image\/(\w+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "jpeg";
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are an expert agricultural analyst helping Indian farmers detect plant diseases.
Provide clear, actionable information in a structured format.
Always include:
- Status: [Healthy/Infected]
- Plant Name: [common Indian crop name]
- Disease/Pest: [specific name if detected]
- Treatment: [practical solutions]
- Prevention: [steps to prevent spread]`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Data
              }
            },
            {
              type: "text",
              text: "Analyze this plant image for diseases or pests. Provide a structured report with: Status, Plant Name, Disease/Pest, Treatment, and Prevention."
            }
          ]
        }
      ]
    });
    const textResponse = message.content.map((block) => {
      if (block.type === "text") return block.text;
      return "";
    }).join("\n").trim();
    res.json({ result: textResponse });
  } catch (error) {
    console.error("Claude API Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || "Claude analysis failed"
    });
  }
});
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  (async () => {
    try {
      const vite = await (0, import_vite.createServer)({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (error) {
      console.error("Failed to start Vite dev server:", error);
    }
  })();
} else {
  const distPath = import_path.default.resolve(process.cwd(), "dist");
  if (!require("fs").existsSync(distPath)) {
    console.error("[Production] dist directory not found at:", distPath);
  } else {
    console.log("[Production] Serving from dist:", distPath);
  }
  app.use(import_express.default.static(distPath, {
    maxAge: "1d",
    etag: true
  }));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(import_path.default.join(distPath, "index.html"), (err) => {
      if (err) {
        console.error("[Production] Error serving index.html:", err);
        res.status(500).send("Server Error");
      }
    });
  });
}
var server_default = app;
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgroShield Server running on http://localhost:${PORT}`);
  });
}
//# sourceMappingURL=server.cjs.map
