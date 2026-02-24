import { Router } from 'express';
import { issueToken } from '../middleware/auth.js';

const router = Router();

router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Missing idToken' });

  const verify = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!verify.ok) return res.status(401).json({ message: 'Invalid token' });

  const profile = await verify.json();
  const appToken = issueToken({
    email: profile.email,
    name: profile.name,
    picture: profile.picture
  });

  res.json({ token: appToken, profile: { email: profile.email, name: profile.name, picture: profile.picture } });
});

export default router;
