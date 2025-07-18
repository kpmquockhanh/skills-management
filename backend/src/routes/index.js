import { Router } from 'express';
import v1 from './v1.js';
import userRoute from './user.js';

const router = Router();


router.get('/health', (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
  };

  res.status(200).send(data);
});

router.use('/user', userRoute);

router.use('/v1', v1);

export default router;
