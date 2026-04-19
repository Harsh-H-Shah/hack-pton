import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const flash = () => genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

function parseJSON(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
  try { return JSON.parse(match ? match[1] : text); }
  catch { return null; }
}

export async function analyzeProduct(base64Image, mimeType = 'image/jpeg') {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  const model = flash();
  const result = await model.generateContent([
    { inlineData: { data: base64Image, mimeType } },
    `You are a carbon footprint expert. Analyze this product image to estimate its total carbon emissions (CO₂e). Focus heavily on manufacturing, transport, packaging, and end-of-life carbon footprint.
Return ONLY valid JSON (no markdown):
{
  "grade": "A",
  "productName": "string",
  "estimatedCarbonKg": number,
  "emissionsBreakdown": {
    "manufacturing": "string (e.g. 'High emissions due to plastic synthesis')",
    "transport": "string",
    "endOfLife": "string"
  },
  "alternatives": ["string"],
  "isGreenwashing": false,
  "greenwashingExplanation": "string or empty",
  "xpReward": 10,
  "summary": "One sentence summary focusing on the carbon emissions of the product."
}
Grade A=excellent, B=good, C=average, D=poor, F=harmful. xpReward 0-15 based on grade.`,
  ]);
  const parsed = parseJSON(result.response.text());
  if (!parsed) throw new Error(`Failed to parse Gemini response: ${result.response.text().slice(0, 200)}`);
  return parsed;
}

export async function estimateDistance(origin, destination) {
  try {
    const result = await flash().generateContent(
      `Estimate the straight-line driving distance in km between "${origin}" and "${destination}".
Return ONLY valid JSON: { "distanceKm": number, "confidence": "high|medium|low" }
If you cannot estimate, return { "distanceKm": 20, "confidence": "low" }.`
    );
    return parseJSON(result.response.text()) ?? { distanceKm: 20, confidence: 'low' };
  } catch (err) {
    console.error('estimateDistance error:', err);
    return { distanceKm: 20, confidence: 'low' };
  }
}

export async function parseActionFromText(text) {
  try {
    const result = await flash().generateContent(
      `Map this message to a sustainability action ID. Available IDs:
bike, walk, transit, carpool, veggie, vegan, local, no-waste, air-dry, cold-wash, lights-off, unplug, recycle, reusable, compost, repair, secondhand, sustainable-brand, minimal

Message: "${text}"
Return ONLY valid JSON: { "actionId": "string or null", "confidence": "high|medium|low" }
Return null if no match.`
    );
    return parseJSON(result.response.text()) ?? { actionId: null, confidence: 'low' };
  } catch (err) {
    console.error('parseActionFromText error:', err);
    return { actionId: null, confidence: 'low' };
  }
}

export async function estimateCustomAction(description) {
  try {
    const result = await flash().generateContent(
      `Estimate the CO₂ savings and XP reward for this sustainable action: "${description}"
Return ONLY valid JSON: { "co2Kg": number, "xp": number, "reasoning": "string" }
co2Kg should be 0.1–5.0. xp should be 1–20. Be realistic.`
    );
    return parseJSON(result.response.text()) ?? { co2Kg: 0.5, xp: 5, reasoning: 'Estimated' };
  } catch (err) {
    console.error('estimateCustomAction error:', err);
    return { co2Kg: 0.5, xp: 5, reasoning: 'Estimated' };
  }
}
