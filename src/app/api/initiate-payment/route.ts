import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  const uuid = crypto.randomUUID().replace(/-/g, '');

  // TODO: Store the ID field in your database so you can verify the payment later

  return NextResponse.json({ id: uuid });
}
