import * as express from 'express';

import { handleRequest } from '../core/middles/service-handler.middle';
import { subscriptionService } from '../services/subscription.service';

const router: express.Router = express.Router();

router.use(
  '/subscription',
  handleRequest(subscriptionService.getEntries.bind(subscriptionService))
);

export default router;
