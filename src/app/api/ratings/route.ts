import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /api/ratings - Get my rating for a specific user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const raterWallet = session.user.walletAddress || session.user.id;
    const ratedWallet = request.nextUrl.searchParams.get('rated_wallet');

    if (!ratedWallet) {
      return NextResponse.json({ error: 'Missing rated_wallet parameter' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('rater_wallet', raterWallet)
      .eq('rated_wallet', ratedWallet)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching rating:', error);
      return NextResponse.json({ error: 'Failed to fetch rating' }, { status: 500 });
    }

    return NextResponse.json({ rating: data?.rating || null });
  } catch (error) {
    console.error('Error in GET /api/ratings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/ratings - Rate a user (or update existing rating)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const raterWallet = session.user.walletAddress || session.user.id;
    const body = await request.json();
    const { rated_wallet, rating } = body;

    if (!rated_wallet || (rating !== 1 && rating !== -1)) {
      return NextResponse.json(
        { error: 'Invalid request. Need rated_wallet and rating (1 or -1)' },
        { status: 400 }
      );
    }

    // Can't rate yourself
    if (raterWallet === rated_wallet) {
      return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
    }

    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from('user_ratings')
      .select('id, rating')
      .eq('rater_wallet', raterWallet)
      .eq('rated_wallet', rated_wallet)
      .single();

    let myRating: 1 | -1 | null = rating;

    if (existingRating) {
      if (existingRating.rating === rating) {
        // Same rating - remove it (toggle off)
        await supabase
          .from('user_ratings')
          .delete()
          .eq('id', existingRating.id);
        myRating = null;
      } else {
        // Different rating - update it
        await supabase
          .from('user_ratings')
          .update({ rating, updated_at: new Date().toISOString() })
          .eq('id', existingRating.id);
      }
    } else {
      // New rating - insert
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          rater_wallet: raterWallet,
          rated_wallet,
          rating,
        });

      if (error) {
        console.error('Error inserting rating:', error);
        return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
      }
    }

    // Update the user's quality_score
    const { data: allRatings } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('rated_wallet', rated_wallet);

    const qualityScore = allRatings?.reduce((sum, r) => sum + r.rating, 0) || 0;

    await supabase
      .from('users')
      .update({ quality_score: qualityScore })
      .eq('wallet_address', rated_wallet);

    return NextResponse.json({ success: true, myRating });
  } catch (error) {
    console.error('Error in POST /api/ratings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
