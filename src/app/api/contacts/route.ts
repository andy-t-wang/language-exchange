import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /api/contacts - Get all contacts for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const userWallet = session.user.walletAddress || session.user.id;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_wallet', userWallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    return NextResponse.json({ contacts: data });
  } catch (error) {
    console.error('Error in GET /api/contacts:', error);
    return NextResponse.json({ contacts: [] });
  }
}

// POST /api/contacts - Save a new contact
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const userWallet = session.user.walletAddress || session.user.id;
    const body = await request.json();

    // Validate required fields
    if (!body.contact_wallet) {
      return NextResponse.json(
        { error: 'Missing required field: contact_wallet' },
        { status: 400 }
      );
    }

    // Store contact data as JSONB
    const contactData = {
      user_wallet: userWallet,
      contact_wallet: body.contact_wallet,
      contact_data: {
        username: body.contact_username || '',
        name: body.contact_name || '',
        country: body.contact_country || '',
        countryCode: body.contact_country_code || 'XX',
        profilePictureUrl: body.contact_profile_picture_url || null,
        nativeLanguages: body.contact_native_languages || [],
        learningLanguages: body.contact_learning_languages || [],
      },
    };

    // Upsert to avoid duplicates (user_wallet + contact_wallet should be unique)
    const { data, error } = await supabase
      .from('contacts')
      .upsert(contactData, {
        onConflict: 'user_wallet,contact_wallet',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving contact:', error);
      return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
    }

    return NextResponse.json({ contact: data });
  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json(
      { error: 'Failed to save contact' },
      { status: 500 }
    );
  }
}
