import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FoodAnalysis } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeFoodImage(base64Image: string, mimeType: string): Promise<FoodAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('請設定 GEMINI_API_KEY 環境變數');
  }
  
  // 嘗試使用 -latest 標籤，並恢復標準呼叫方式
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `你是一位專業的營養師和食物辨識專家。請分析這張食物照片，回傳以下資訊。

請以純 JSON 格式回傳（不要加 markdown 標記），格式如下：
{
  "name": "食物品名（繁體中文）",
  "calories": 預估熱量（kcal，數字）,
  "protein": 蛋白質含量（g，數字）,
  "carbs": 碳水化合物含量（g，數字）,
  "fat": 脂肪含量（g，數字）,
  "estimatedPrice": 預估台灣售價（新台幣，數字）,
  "confidence": "high/medium/low（辨識信心度）"
}

注意事項：
- 如果照片中有多種食物，請合併為一餐的總營養資訊，品名用主要食物名稱
- 熱量和營養素數值請盡量精確
- 價格以台灣常見售價估算
- 只回傳 JSON，不要有其他文字`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  
  // Clean up potential markdown code block wrapper
  const cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as FoodAnalysis;
    return {
      name: parsed.name || '未知食物',
      calories: Math.round(parsed.calories || 0),
      protein: Math.round(parsed.protein * 10) / 10 || 0,
      carbs: Math.round(parsed.carbs * 10) / 10 || 0,
      fat: Math.round(parsed.fat * 10) / 10 || 0,
      estimatedPrice: Math.round(parsed.estimatedPrice || 0),
      confidence: parsed.confidence || 'medium',
    };
  } catch {
    throw new Error('AI 回傳格式錯誤，請重新拍攝');
  }
}
