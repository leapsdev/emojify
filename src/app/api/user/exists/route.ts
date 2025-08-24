import { getPrivyId } from '@/lib/auth';
import { isIdExists } from '@/repository/db/user/actions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getPrivyId();

    if (!userId) {
      return NextResponse.json(
        { exists: false, error: 'No user ID found' },
        { status: 401 },
      );
    }

    const exists = await isIdExists(userId);

    return NextResponse.json({ exists, userId });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { exists: false, error: 'Failed to check user existence' },
      { status: 500 },
    );
  }
}
