import * as Sequelize from 'sequelize';
import * as fs from 'fs';

import config from '../core/config';
import logger from '../core/utils/logger.util';

class DB {
  public db: any = {};
  public sequelize: Sequelize.Sequelize;

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
    fs.readdirSync(`${__dirname}/models`)
      .filter(file => {
        return file.endsWith('js');
      })
      .forEach(file => {
        const model: any = this.sequelize.import(`${__dirname}/models/${file}`);
        this.db[model['name']] = model;
      });
  }

  public connect(): any {
    return this.sequelize
      .authenticate()
      .then(() => {
        logger.info('Connection to DB successful');

        return this.sequelize.sync();
      })
      .catch(error => logger.error(`Error create connection: ' ${error}`));
  }
}

const dbInstance = new DB();

export default dbInstance;
export const db = dbInstance.db;
export const sequelize = dbInstance.sequelize;
