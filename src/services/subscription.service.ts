import { db } from '../db';
import * as crypto from 'crypto';

class SubscriptionService {
  async createSubscription(params: any) {
    const { body } = params;
    const hash = crypto.randomBytes(20).toString('hex');
    const subscriptionType = await db.SubscriptionTypeModel.findOne({
      where: { name: body.type }
    });
    /*const lastDate = "get date now";*/

    const subscription = {
      hash,
      email: body.email,
      type_id: subscriptionType.id,
      subs_params: JSON.stringify(body.subs_params),
    };

    return db.SubscriptionModel.create(subscription);
  }
  async deleteSubscription(params: any) {
    const { body } = params;
    const hashId = String(body.hashId);
    const subscriptionToDelete = await db.SubscriptionModel.findOne({
      where: { hash: hashId }
    });
    if (subscriptionToDelete) {
      subscriptionToDelete.destroy();
    }
    
    return {'result': 'Unsubscribed'};
  }
}

const subscriptionService = new SubscriptionService();
export { subscriptionService, SubscriptionService };
