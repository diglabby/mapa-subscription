import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import BaseRouter from './routes';
import DB from './db';

import config from './core/config';
import logger from './core/utils/logger.util';
import { handleError } from './core/middles/error-handler.middle';

class Server {
  public app: express.Application;
  private PORT = process.env.PORT || config.PORT;

  constructor() {
    this.app = express();
    this.initConfig();
    this.initRoutes();
    this.initDB();
    this.start();
  }

  private initConfig(): void {
    if (config.env !== 'prod') {
      this.app.use(morgan('dev'));
    }

    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
        parameterLimit: 5000,
        limit: '50mb'
      })
    );

    this.app.use(cors(config.corsOptions));
  }

  private initRoutes(): void {
    this.app.use('/api', BaseRouter);

    this.app.use((req, res) => {
      res.send('Route not found');
    });

    this.app.use((err: any, req: any, res: any, next: any) => {
      if (!next) {
        handleError(err, res);
      }
      next(err, req, res);
    });
  }

  private start(): any {
    return this.app.listen(this.PORT, () => {
      logger.info(`Server listening on : ${this.PORT}`);
    });
  }

  private initDB(): void {
    return DB.connect();
  }
}

export const server = new Server();
