import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodImage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType } = body;

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: '缺少圖片資料' },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    const result = await analyzeFoodImage(base64Data, mimeType);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyze error:', error);
    const message = error instanceof Error ? error.message : '分析失敗，請重試';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
