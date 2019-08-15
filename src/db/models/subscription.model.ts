import { Model } from 'sequelize';

export class SubscriptionModel extends Model {
  id: number;
  hash: string;
  email: string;
  type_id: number;
  last_date: number;
  subs_params: string;
}
