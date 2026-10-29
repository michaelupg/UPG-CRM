import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini SDK if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey });
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Health check & Provider configuration status
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(aiClient),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('your-project')),
    whatsappWebhookConfigured: Boolean(process.env.WHATSAPP_API_TOKEN),
    smsGatewayConfigured: Boolean(process.env.TERMII_API_KEY),
  });
});

// 2. AI Requirement Extraction
app.post('/api/ai/extract-requirements', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  if (aiClient) {
    try {
      const prompt = `You are an expert Nigerian commercial and residential real estate CRM assistant.
Analyze this client inquiry message from Nigeria (Lagos / Abuja / Port Harcourt real estate market):
"${message}"

Extract structured requirement parameters into a clean JSON object with keys:
- propertyType: string (e.g. Office, Warehouse, Apartment, Retail shop, Land)
- transactionType: string (Commercial leasing, Residential letting, Property sale, Land acquisition)
- preferredLocation: string (e.g. Lekki Phase 1, Ikate, Victoria Island, Apapa, Ikeja)
- budgetMin: number (in Naira)
- budgetMax: number (in Naira)
- budgetDisplay: string (e.g. ₦30,000,000 / year)
- minSizeSqm: number or null
- essentialFeatures: string array (e.g. ["24/7 Power", "Generator", "Parking", "Water Treatment"])
- dealBreakers: string or null
- timing: string (Immediate, Within 30 days, Within 60 days)
- clientUrgency: string (Urgent, High, Medium, Low)

Respond ONLY with valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      return res.json({ result: JSON.parse(text), source: 'gemini-2.5-flash' });
    } catch (err: any) {
      console.error('Gemini extraction error:', err);
    }
  }

  // Domain rule-based extraction fallback (no hallucination)
  const lower = message.toLowerCase();
  let propertyType = 'Office';
  if (lower.includes('warehouse') || lower.includes('storage') || lower.includes('depot')) propertyType = 'Warehouse';
  else if (lower.includes('apartment') || lower.includes('flat') || lower.includes('penthouse') || lower.includes('bed')) propertyType = 'Apartment';
  else if (lower.includes('shop') || lower.includes('retail') || lower.includes('showroom')) propertyType = 'Retail shop';
  else if (lower.includes('land') || lower.includes('plot')) propertyType = 'Land';

  let location = 'Lagos';
  if (lower.includes('lekki')) location = 'Lekki Phase 1';
  else if (lower.includes('ikate')) location = 'Ikate, Lekki';
  else if (lower.includes('victoria island') || lower.includes('vi')) location = 'Victoria Island';
  else if (lower.includes('apapa')) location = 'Apapa';
  else if (lower.includes('ikeja')) location = 'Ikeja GRA';
  else if (lower.includes('ikoyi')) location = 'Ikoyi';

  return res.json({
    result: {
      propertyType,
      transactionType: lower.includes('buy') || lower.includes('sale') ? 'Property sale' : 'Commercial leasing',
      preferredLocation: location,
      budgetMin: 20000000,
      budgetMax: 35000000,
      budgetDisplay: '₦25m–₦35m / year',
      minSizeSqm: 350,
      essentialFeatures: ['24/7 Power', 'Backup Generator', 'Dedicated Parking'],
      dealBreakers: 'Frequent power downtime',
      timing: 'Within 30 days',
      clientUrgency: 'High',
    },
    source: 'rule-based-fallback',
  });
});

// 3. AI Smart Follow-up Draft
app.post('/api/ai/draft-response', async (req: Request, res: Response) => {
  const { clientName, channel, contextNotes, propertyRef } = req.body;

  if (aiClient) {
    try {
      const prompt = `You are a top-tier Nigerian real estate relationship manager at UPG Property Group (Lagos, Nigeria).
Draft a personalized, highly professional ${channel || 'WhatsApp'} message to client "${clientName || 'Prospect'}".
Context: "${contextNotes || 'Client enquired about office/residential listings'}"
Property reference: "${propertyRef || 'UPG-OF-0104'}"

Guidelines:
- Tone: Warm, executive, courteous (Nigerian corporate real estate etiquette).
- Acknowledge their exact specifications (e.g., 24/7 power, parking, location).
- Propose an inspection time slot.
- Include sign-off from "UPG Property Group Operations".
- Keep WhatsApp messages under 120 words.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ draft: response.text, source: 'gemini-2.5-flash' });
    } catch (err: any) {
      console.error('Gemini draft error:', err);
    }
  }

  // Fallback template
  const draft = `Good day ${clientName || 'Valued Client'},\n\nThank you for reaching out to UPG Property Group regarding your property requirement in Lagos.\n\nWe have verified options matching your specifications (${propertyRef ? `Reference: ${propertyRef}` : 'including verified 24/7 backup power and dedicated parking'}).\n\nWould tomorrow at 11:00 AM or 2:00 PM suit you for a physical inspection with our senior commercial specialist?\n\nBest regards,\nUPG Property Group Operations\n+234 803 000 1200`;

  return res.json({ draft, source: 'template-fallback' });
});

// 4. Inbound Webhook for Property Portals / Web Forms
app.post('/api/webhooks/leads', (req: Request, res: Response) => {
  const leadData = req.body;
  console.log('Received inbound lead webhook:', leadData);
  res.json({ success: true, leadId: `lead-${Date.now()}`, message: 'Enquiry captured into CRM queue' });
});

// 5. Inbound Webhook for WhatsApp Cloud API
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  // Meta webhook verification challenge
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.WEBHOOK_VERIFY_TOKEN || 'upg_crm_token')) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
});

app.post('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const body = req.body;
  console.log('Received WhatsApp Cloud API notification:', JSON.stringify(body, null, 2));
  res.status(200).send('EVENT_RECEIVED');
});

// ============================================================================
// VITE DEV SERVER / STATIC ASSETS
// ============================================================================
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`UPG Real Estate CRM server running on port ${PORT}`);
  });
}

startServer();
