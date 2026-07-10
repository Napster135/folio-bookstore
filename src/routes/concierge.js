import { Router } from 'express';
import { chat } from '../controllers/conciergeController.js';

const conciergeRouter = Router();

conciergeRouter.post('/chat', chat);

export default conciergeRouter;
