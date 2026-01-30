import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

sqlite3.verbose();
const db = new sqlite3.Database('./server/db.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS analysis_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      soldier_id TEXT,
      status_summary TEXT,
      health_risk TEXT,
      immediate_action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const app = express();
app.use(cors());
app.use(express.json());

async function callWithRetry(fn, retries = 2, delay = 2000) {
  try {
    return await fn();
  } catch (error) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429;
    if (isRateLimit && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

app.post('/api/analyze-soldier', async (req, res) => {
  try {
    const soldier = req.body;
    if (!soldier?.id || !soldier?.vitals || !soldier?.environment || !soldier?.rank || !soldier?.name) {
      return res.status(400).json({ error: 'Invalid soldier payload' });
    }

    const response = await callWithRetry(async () => {
      const aiResp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following tactical data for Soldier ${soldier.rank} ${soldier.name} (${soldier.id}). 
Health Vitals: HR ${soldier.vitals.heartRate} bpm, Temp ${soldier.vitals.temperature}°C, SpO2 ${soldier.vitals.spO2}%, Hydration ${soldier.vitals.hydration}%.
Environment: Temp ${soldier.environment.externalTemp}°C, Radiation ${soldier.environment.radiation}uSv/h, Toxic Gas ${soldier.environment.toxicGas}ppm.
Location: Alt ${soldier.location?.alt ?? 'N/A'}m.

Provide a brief tactical recommendation for the command center in a JSON format with 'status_summary', 'health_risk', and 'immediate_action'.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status_summary: { type: Type.STRING },
              health_risk: { type: Type.STRING },
              immediate_action: { type: Type.STRING },
            },
            required: ['status_summary', 'health_risk', 'immediate_action'],
          },
        },
      });
      return JSON.parse(aiResp.text);
    });

    db.run(
      `INSERT INTO analysis_logs (soldier_id, status_summary, health_risk, immediate_action) VALUES (?, ?, ?, ?)`,
      [soldier.id, response.status_summary, response.health_risk, response.immediate_action],
      (err) => {
        if (err) {
          console.error('DB insert error', err);
        }
      }
    );

    res.json(response);
  } catch (error) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429;
    if (isRateLimit) {
      return res.status(200).json({
        status_summary: 'AI quota temporarily exhausted. Using local heuristics.',
        health_risk: 'Baseline (Quota Restricted)',
        immediate_action: 'Continue standard monitoring protocols.',
        is_error: true,
        error_type: 'RATE_LIMIT',
      });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/briefing', async (req, res) => {
  try {
    const { soldiers } = req.body;
    if (!Array.isArray(soldiers)) {
      return res.status(400).json({ error: 'Invalid payload: soldiers[] required' });
    }
    const context = soldiers.map((s) => `${s.rank} ${s.name}: ${s.status}`).join('; ');
    const text = await callWithRetry(async () => {
      const aiResp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short tactical briefing for the Unit Commander based on this squad status: ${context}. Keep it under 60 words. Focus on readiness.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      return aiResp.text;
    });
    res.json({ text });
  } catch (error) {
    res.json({
      text: 'Operational uplink saturated. Squad monitoring continues on secondary protocols.',
    });
  }
});

app.get('/api/logs', (req, res) => {
  db.all(
    `SELECT id, soldier_id, status_summary, health_risk, immediate_action, created_at FROM analysis_logs ORDER BY created_at DESC LIMIT 50`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'DB error' });
      }
      res.json({ logs: rows });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
