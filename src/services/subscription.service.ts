import { db } from '../db';
import * as crypto from 'crypto';

class SubscriptionService {
  createSubscription(params: any) {
    const body = params.body;
    const hash = crypto.randomBytes(20).toString('hex');
    const subscription = {
      ...body,
      hash
    };

    return db.SubscriptionModel.create(subscription);
  }
}

const subscriptionService = new SubscriptionService();
export { subscriptionService, SubscriptionService };
