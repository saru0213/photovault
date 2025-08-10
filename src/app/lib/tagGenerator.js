import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function imageUrlToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

export async function generateTagsFromImage(imageUrl) {
  try {
    const base64 = await imageUrlToBase64(imageUrl);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64,
        },
      },
      {
        text: 'Give 3 simple tags for this image, separated by commas.',
      },
    ]);

    const text = response?.candidates?.[0]?.output || '';
    const tags = text.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    return tags.length ? tags : ['untagged'];
  } catch (e) {
    console.error('Error:', e);
    return ['untagged'];
  }
}
