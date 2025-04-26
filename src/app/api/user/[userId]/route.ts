import { PrivyClient } from '@privy-io/server-auth';
import { type NextRequest, NextResponse } from 'next/server';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || '',
);

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }
    const user = await privy.getUser(userId);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
