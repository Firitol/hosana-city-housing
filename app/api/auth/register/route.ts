import { NextRequest } from 'next/server';
import { POST as registrationPost, dynamic, revalidate } from '../registration/route';

export { dynamic, revalidate };

export async function POST(request: NextRequest) {
  return registrationPost(request);
}
