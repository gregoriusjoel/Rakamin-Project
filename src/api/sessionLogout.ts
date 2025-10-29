import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  const session = req.cookies?.session;
  if (!session) {
    res.setHeader('Set-Cookie', `session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
    res.status(200).json({ success: true });
    return;
  }

  try {
    const decoded = await admin.auth().verifySessionCookie(session, true);
    await admin.auth().revokeRefreshTokens(decoded.sub || decoded.uid);
  } catch (err) {
    console.warn('sessionLogout: could not verify session cookie', err);
  }

  res.setHeader('Set-Cookie', `session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
  res.status(200).json({ success: true });
}
