import { Router } from 'express';
import { identifyContact } from '../services/identifyService.js';

const router: Router = Router();

router.post('/identify', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    const result = await identifyContact({
      email: email,
      phoneNumber: phoneNumber
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

export default router;
