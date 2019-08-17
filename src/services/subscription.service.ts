import { db } from '../db';
import * as crypto from 'crypto';

class SubscriptionService {
  async createSubscription(params: any) {
    const { body } = params;
    const hash = crypto.randomBytes(20).toString('hex');
    const subscriptionType = await db.SubscriptionTypeModel.findOne({
      where: { name: body.type }
    });

    const subscription = {
      hash,
      email: body.email,
      type_id: subscriptionType.id
    };

    return db.SubscriptionModel.create(subscription);
  }
}

const subscriptionService = new SubscriptionService();
export { subscriptionService, SubscriptionService };
