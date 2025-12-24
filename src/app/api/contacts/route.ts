import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /api/contacts - Get all contacts for the current user
// Includes both contacts you initiated AND people who contacted you
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const userWallet = session.user.walletAddress || session.user.id;

    // Get contacts you initiated (you are user_wallet)
    const { data: initiatedContacts, error: initiatedError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_wallet', userWallet)
      .order('created_at', { ascending: false });

    if (initiatedError) {
      console.error('Error fetching initiated contacts:', initiatedError);
    }

    // Get contacts where others initiated with you (you are contact_wallet)
    const { data: receivedContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('contact_wallet', userWallet)
      .order('created_at', { ascending: false });

    // For received contacts, we need to look up the user info of who contacted us
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let receivedWithUserData: Array<any> = [];
    if (receivedContacts && receivedContacts.length > 0) {
      const userWallets = receivedContacts.map(c => c.user_wallet);
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .in('wallet_address', userWallets);

      // Transform received contacts to match the expected format
      receivedWithUserData = receivedContacts.map(contact => {
        const user = users?.find(u => u.wallet_address === contact.user_wallet);
        if (user) {
          return {
            ...contact,
            // Swap so contact_wallet points to the person (the one who contacted us)
            contact_wallet: contact.user_wallet,
            contact_data: {
              username: user.username,
              name: user.name,
              country: user.country,
              countryCode: user.country_code,
              profilePictureUrl: user.profile_picture_url,
              nativeLanguages: user.native_languages,
              learningLanguages: user.learning_languages,
            },
            initiated_by_them: true, // Flag to show they reached out
          };
        }
        return null;
      }).filter((c): c is NonNullable<typeof c> => c !== null);
    }

    // Mark initiated contacts
    const initiatedWithFlag = (initiatedContacts || []).map(contact => ({
      ...contact,
      initiated_by_them: false,
    }));

    // Merge and deduplicate contacts (prefer the most recent)
    const contactMap = new Map<string, typeof initiatedWithFlag[0]>();

    // Add all contacts, keeping track of who initiated
    for (const contact of [...initiatedWithFlag, ...receivedWithUserData]) {
      const existingContact = contactMap.get(contact.contact_wallet);
      if (!existingContact || new Date(contact.created_at) > new Date(existingContact.created_at)) {
        contactMap.set(contact.contact_wallet, contact);
      }
    }

    const allContacts = Array.from(contactMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ contacts: allContacts });
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

    // Check if contact already exists
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_wallet', userWallet)
      .eq('contact_wallet', body.contact_wallet)
      .single();

    const isNewContact = !existingContact;

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

    return NextResponse.json({ contact: data, isNewContact });
  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json(
      { error: 'Failed to save contact' },
      { status: 500 }
    );
  }
}
