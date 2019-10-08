import * as express from 'express';

import { handleRequest } from '../core/middles/service-handler.middle';
import { subscriptionService } from '../services/subscription.service';

const subscription: express.Router = express.Router();

subscription.post(
  '/subscription',
  handleRequest(
    subscriptionService.createSubscription.bind(subscriptionService)
  )
);
subscription.delete(
  '/subscription',
  handleRequest(
    subscriptionService.deleteSubscription.bind(subscriptionService)
  )
);

export default subscription;
