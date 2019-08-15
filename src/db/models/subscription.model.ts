import * as Sequelize from 'sequelize';

export class Subscription {
  id: number;
  hash: string;
  email: string;
  type_id: number;
  last_date: number;
  subs_params: string;

  constructor(
    id: number,
    hash: string,
    email: string,
    type_id: number,
    last_date: number,
    subs_params: string
  ) {
    this.id = id;
    this.hash = hash;
    this.email = email;
    this.type_id = type_id;
    this.last_date = last_date;
    this.subs_params = subs_params;
  }
}

export interface SubscriptionInstance
  extends Sequelize.Instance<Subscription> {}

export default function defineUser(
  sequelize: Sequelize.Sequelize
): Sequelize.Model<SubscriptionInstance, Subscription> {
  return sequelize.define<SubscriptionInstance, Subscription>(
    'Subscription',
    {
      hash: Sequelize.STRING,
      email: Sequelize.STRING,
      type_id: Sequelize.INTEGER,
      last_date: Sequelize.INTEGER,
      subs_params: Sequelize.STRING
    },
    {
      tableName: 'Subscription'
    }
  );
}
