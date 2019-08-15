import * as express from 'express';

import SubscriptionRouter from './subscription.routes';

const router: express.Router = express.Router();

router.use(SubscriptionRouter);

export default router;
