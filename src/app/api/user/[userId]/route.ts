import { PrivyClient } from '@privy-io/server-auth';
import { NextResponse } from 'next/server';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || '',
);

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = await Promise.resolve(params).then((p) => p.userId);

    const user = await privy.getUser(userId);

    console.log('Fetched user:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
