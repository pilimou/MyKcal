import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProfile, resetShareToken } from '@/lib/notion';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.email);
  return NextResponse.json({ shareToken: profile?.shareToken || '' });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newToken = await resetShareToken(session.user.email);
    return NextResponse.json({ success: true, shareToken: newToken });
  } catch (error) {
    console.error('Reset share token error:', error);
    return NextResponse.json({ error: '重設分享代碼失敗' }, { status: 500 });
  }
}
