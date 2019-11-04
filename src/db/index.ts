import { Sequelize, DataTypes } from 'sequelize';

import config from '../core/config';
import logger from '../core/utils/logger.util';
import { SubscriptionModel } from './models/subscription.model';
import { SubscriptionTypeModel } from './models/subscription-type.model';

class DB {
  public db: any = {};
  public sequelize: any;

  constructor() {
    this.sequelize = new Sequelize(
      config.db.credentials.dbName,
      config.db.credentials.dbUser,
      config.db.credentials.dbPassword,
      config.db.dbSettings
    );

    this.initModels();
  }

  private initModels() {
    SubscriptionModel.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        name: DataTypes.STRING,
        hash: DataTypes.STRING,
        email: DataTypes.STRING,
        type_id: DataTypes.INTEGER,
        last_date: DataTypes.INTEGER,
        subs_params: DataTypes.STRING
      },
      {
        sequelize: this.sequelize,
        tableName: 'Subscription'
      }
    );

    SubscriptionTypeModel.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        name: DataTypes.STRING
      },
      {
        sequelize: this.sequelize,
        tableName: 'SubscriptionType'
      }
    );
  }

  public connect(): any {
    return this.sequelize
      .authenticate()
      .then(() => {
        logger.info('Connection to DB successful');

        return this.sequelize.sync();
      })
      .then(() => this.populateTable())
      .catch(error => logger.error(`Error create connection: ' ${error}`));
  }

  private async populateTable() {
    try {
      const subscriptionTypes = [{ name: 'I' }, { name: 'G' }, { name: 'GT' }];

      await db.SubscriptionTypeModel.bulkCreate(subscriptionTypes, {
        fields:["name"] ,
        updateOnDuplicate: ["name"]
    } );
    } catch (err) {
      logger.info(`Error populate table: ${err}`);
    }
  }
}

const dbInstance = new DB();

export default dbInstance;
export const db = { ...dbInstance.sequelize.models };
export const sequelize = dbInstance.sequelize;
