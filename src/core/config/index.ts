import * as log from 'winston';
import * as path from 'path';

import { getConfigByEnv } from '../utils/config.util';

const config: any = {
  development: {
    env: 'development',
    PORT: 3001,
    mailer: {
      smtp: 'smtps://mapa@falanster.by:Mapa-Hack@falanster.by/?pool=true',
      mail: 'mapa@falanster.by',
      subject: 'Newsletter',
      reply: 'mapa@falanster.by'
    },
    db: {
      credentials: {
        dbName: 'subscription',
        dbUser: 'falanster',
        dbPassword: 'falanster'
      },
      dbSettings: {
        host: 'localhost',
        dialect: 'sqlite',
        port: 3001,
        logging: false,

        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },

        charset: 'utf8',
        collate: 'utf8_general_ci',
        storage: path.resolve(__dirname, 'data/subscriptions.db')
      }
    },
    emailSecret: 'emailsecret',
    logger: {
      level: 'debug',
      transports: [
        new log.transports.File({
          filename: 'debug-all.log',
          timestamp: true,
          colorize: true,
          level: 'debug'
        }),
        new log.transports.Console({
          timestamp: true,
          colorize: true,
          level: 'debug'
        })
      ]
    },
    corsOptions: {
      origin: '*'
    }
  },
  prod: {
    env: 'prod',
    PORT: 3001,
    mailer: {
      smtp: 'smtps://immofy-dev%404-net.de:Kmtn17!1@4-net.de',
      mail: 'immofy-dev@4-net.de',
      subject: 'Activate registration of Immofy: ',
      reply: 'immofy-dev@4-net.de'
    },
    db: {
      credentials: {
        dbName: 'immo',
        dbUser: 'immo',
        dbPassword: 'immo0197'
      },
      dbSettings: {
        host: 'localhost',
        dialect: 'mysql',
        port: 3306,
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        charset: 'utf8',
        collate: 'utf8_general_ci'
      }
    },
    emailSecret: 'emailsecret',
    logger: {
      level: 'info',
      transports: [
        new log.transports.File({
          filename: 'debug-all.log',
          timestamp: true,
          colorize: true,
          level: 'debug'
        }),
        new log.transports.Console({
          timestamp: true,
          colorize: true,
          level: 'debug'
        })
      ]
    },
    corsOptions: {
      origin: '*'
    }
  }
};

export default getConfigByEnv(config);
