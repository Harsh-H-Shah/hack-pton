import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyCQeCPTB4KwmpS1FVUypiwcS2293Q6pjFE");
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const mimeType = "image/png";

try {
  const result = await model.generateContent([
    {
      inlineData: { data: base64Image, mimeType },
    },
    `You are a sustainability expert. Analyze this product image and return ONLY valid JSON (no markdown):
{
  "grade": "A",
  "productName": "string",
  "materials": ["string"],
  "carbonImpact": "low|medium|high",
  "concerns": ["string"],
  "alternatives": ["string"],
  "isGreenwashing": false,
  "greenwashingExplanation": "string or empty",
  "xpReward": 10,
  "summary": "one sentence"
}
Grade A=excellent, B=good, C=average, D=poor, F=harmful. xpReward 0-15 based on grade.`
  ]);
  console.log(result.response.text());
} catch (err) {
  console.error("ERROR CAUGHT:");
  console.error(err);
}
