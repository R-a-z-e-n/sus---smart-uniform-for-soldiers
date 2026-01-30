
import { Soldier } from "../types";
const API_BASE = "/api";

// Simple in-memory cache to save quota
const analysisCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Helper to handle API calls with exponential backoff for 429 errors
 */
async function callWithRetry(fn: () => Promise<any>, retries = 2, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes("429") || error?.status === 429;
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const analyzeSoldierStatus = async (soldier: Soldier, forceRefresh = false) => {
  const cacheKey = `${soldier.id}-${soldier.status}`;
  const cached = analysisCache[cacheKey];
  
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const result = await callWithRetry(async () => {
      const resp = await fetch(`${API_BASE}/analyze-soldier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(soldier)
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || `HTTP ${resp.status}`);
      }
      return await resp.json();
    });

    analysisCache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Check if it's specifically a rate limit error to return a helpful object
    if (error?.message?.includes("429") || error?.status === 429) {
      return {
        status_summary: "AI quota temporarily exhausted. Using local heuristics.",
        health_risk: soldier.status === 'DISTRESS' ? "High (Biometric Alert)" : "Baseline (Quota Restricted)",
        immediate_action: "Continue standard monitoring protocols.",
        is_error: true,
        error_type: 'RATE_LIMIT'
      };
    }

    return {
      status_summary: "Analyzing data...",
      health_risk: "Unknown",
      immediate_action: "Monitor closely.",
      is_error: true
    };
  }
};

export const generateOperationalBriefing = async (soldiers: Soldier[]) => {
  // Use a simpler cache for briefing
  const cacheKey = 'global-briefing';
  const cached = analysisCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp < 120000)) { // 2 min cache for briefing
    return cached.data;
  }

  try {
    const text = await callWithRetry(async () => {
      const resp = await fetch(`${API_BASE}/briefing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soldiers })
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      return data.text;
    });
    
    analysisCache[cacheKey] = { data: text, timestamp: Date.now() };
    return text;
  } catch (error) {
    return "Operational uplink saturated. Squad monitoring continues on secondary protocols.";
  }
};
