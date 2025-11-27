import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const WORLD_NOTIFICATION_URL = 'https://developer.worldcoin.org/api/v2/minikit/send-notification';

// POST /api/send-notification - Send notification to a user
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.wallet_address) {
      return NextResponse.json(
        { error: 'Missing required field: wallet_address' },
        { status: 400 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_APP_ID;
    if (!appId) {
      console.error('NEXT_PUBLIC_APP_ID not configured');
      return NextResponse.json(
        { error: 'App not configured for notifications' },
        { status: 500 }
      );
    }

    const senderName = session.user.name || session.user.username || 'Someone';

    const notificationPayload = {
      app_id: appId,
      wallet_addresses: [body.wallet_address],
      title: '💬 New Lingua message!',
      message: `${senderName} wants to practice languages with you! Check your message requests in World Chat.`,
      mini_app_path: encodeURIComponent('/home'),
    };

    const response = await fetch(WORLD_NOTIFICATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to send notification:', result);
      return NextResponse.json(
        { error: 'Failed to send notification', details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in POST /api/send-notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
