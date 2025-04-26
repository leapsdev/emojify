import { PrivyClient } from '@privy-io/server-auth';
import { NextRequest, NextResponse } from 'next/server';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || '',
);

type Context = {
  params: {
    userId: string;
  };
};

export async function GET(
  _request: NextRequest,
  context: Context
) {
  try {
    const userId = context.params.userId;
    const user = await privy.getUser(userId);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
