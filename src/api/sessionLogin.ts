import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { idToken } = req.body || {};
  if (!idToken) {
    res.status(400).json({ error: 'Missing idToken' });
    return;
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const secure = process.env.NODE_ENV === 'production';

    res.setHeader('Set-Cookie', `session=${sessionCookie}; Max-Age=${Math.floor(expiresIn / 1000)}; HttpOnly; Path=/; ${secure ? 'Secure; ' : ''}SameSite=Lax`);
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('sessionLogin error', err);
    res.status(500).json({ error: err?.message || 'Failed to create session cookie' });
  }
}
