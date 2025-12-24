import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// POST /api/ratings/batch - Get my ratings for multiple users
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const raterWallet = session.user.walletAddress || session.user.id;
    const body = await request.json();
    const { wallet_addresses } = body;

    if (!wallet_addresses || !Array.isArray(wallet_addresses)) {
      return NextResponse.json(
        { error: 'Invalid request. Need wallet_addresses array' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_ratings')
      .select('rated_wallet, rating')
      .eq('rater_wallet', raterWallet)
      .in('rated_wallet', wallet_addresses);

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }

    // Convert to a map of wallet -> rating
    const ratings: Record<string, 1 | -1> = {};
    data?.forEach((r) => {
      ratings[r.rated_wallet] = r.rating as 1 | -1;
    });

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error('Error in POST /api/ratings/batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
