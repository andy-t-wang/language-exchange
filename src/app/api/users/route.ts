import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /api/users - Get all users or search by language
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language');
    const excludeWallet = searchParams.get('exclude');

    let query = supabase.from('users').select('*');

    if (language) {
      query = query.or(
        `native_languages.cs.{${language}},learning_languages.cs.{${language}}`
      );
    }

    if (excludeWallet) {
      query = query.neq('wallet_address', excludeWallet);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error('Supabase not configured:', error);
    return NextResponse.json({ users: [] });
  }
}

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Verify user is authenticated
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate that the wallet address matches the session
    // The session contains the wallet address from World App auth
    const sessionWalletAddress = session.user.walletAddress || session.user.id;

    if (body.wallet_address && body.wallet_address !== sessionWalletAddress) {
      return NextResponse.json(
        { error: 'Wallet address mismatch' },
        { status: 403 }
      );
    }

    // Ensure wallet_address is set from session
    const userData = {
      wallet_address: sessionWalletAddress,
      username: body.username || session.user.username || 'user',
      profile_picture_url: body.profile_picture_url || session.user.profilePictureUrl || null,
      name: body.name,
      country: body.country,
      country_code: body.country_code,
      native_languages: body.native_languages || [],
      learning_languages: body.learning_languages || [],
      notifications_enabled: body.notifications_enabled || false,
    };

    // Validate required fields
    if (!userData.name || !userData.country || !userData.country_code) {
      return NextResponse.json(
        { error: 'Missing required fields: name, country, country_code' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error) {
      console.error('Error saving user:', error);
      return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }
}
