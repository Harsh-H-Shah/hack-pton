import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseJSON(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
  try { return JSON.parse(match ? match[1] : text); }
  catch { return null; }
}

async function categorize(userText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(
    `You are the sustainability coach for "Live Laugh Plant", a gamified eco-tracker app. Fun, punny, plant-obsessed personality.

Categorize this eco-friendly action and celebrate the user.

Categories:
- transport: biking, walking, public transit, carpooling, EV
- food: vegan/vegetarian meals, local produce, zero food waste
- energy: cold wash, air dry, unplugging devices, solar panels, optimizing thermostat, reducing electricity use
- waste: recycling, composting, reusables, repairing instead of replacing
- shopping: secondhand, sustainable brands, skipping unnecessary purchases
- nature: planting trees/saplings, community/park cleanup, pollinator plants, rainwater collection, skipping lawn mowing, wildlife habitat

User said: "${userText}"

Return ONLY valid JSON:
{
  "category": "transport|food|energy|waste|shopping|nature|unknown",
  "categoryEmoji": "🚲|🥗|⚡|♻️|🛍️|🌳|🌿",
  "categoryName": "Transport|Food|Energy|Waste|Shopping|Nature",
  "message": "1-2 sentence enthusiastic reply with a plant pun or fun eco fact"
}`
  );
  return parseJSON(result.response.text());
}

const app = await Spectrum({
  projectId: "0c8bfd35-90d9-4413-a24d-0f44aa955d1a",
  projectSecret: "l5Bt-Ul7KHbSmkWQJOF7ygy4ggsXs0g8go6cjvqPaAw",
  providers: [imessage.config()],
});

console.log("🌱 Live Laugh Plant agent running...");

for await (const [space, message] of app.messages) {
  if (message.content.type !== "text") continue;

  const userText = message.content.text.trim();
  if (!userText) continue;

  console.log(`[${message.platform}] ${message.sender.id}: ${userText}`);

  await space.responding(async () => {
    const res = await categorize(userText).catch(() => null);

    if (!res || res.category === "unknown") {
      await space.send(res?.message ?? "🌱 Tell me something eco-friendly you did and I'll celebrate you!");
      return;
    }

    await space.send(`${res.categoryEmoji} ${res.categoryName.toUpperCase()}\n\n${res.message}`);
  });
}
