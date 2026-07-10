import { Router } from 'express';
const guestRouter = Router();
import { guestCheckout, guestConfirm } from '../controllers/stripeManager.js';

guestRouter.post('/checkout', guestCheckout);
guestRouter.post('/confirm', guestConfirm);

export default guestRouter;
