import * as express from 'express';
import * as _ from 'lodash';

import { handleError } from '../middles/error-handler.middle';

class ServiceHandler {
  private requestMethods: any = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    delete: 'DELETE'
  };

  private defParams(req: express.Request): Object {
    return {
      query: req.query,
      host: _.get(req, 'User-Host'),
      req: req,
      userId: _.get(req, 'user.id'),
      userRole: _.get(req, 'user.role'),
      file: _.get(req, 'file'),
      files: _.get(req, 'files')
    };
  }

  private getMethod(req: express.Request): Object {
    return {
      id: req.params.id,
      id2: req.params.id2
    };
  }

  private postMethod(req: express.Request): Object {
    return {
      id: req.params.id,
      id2: req.params.id2,
      body: req.body
    };
  }

  private deleteMethod(req: express.Request): Object {
    return {
      id: req.params.id,
      id2: req.params.id2,
      body: req.body
    };
  }

  private parseParameters(req: express.Request): Object {
    let params = {};
    switch (req.method) {
      case this.requestMethods.get:
        params = this.getMethod(req);
        break;
      case this.requestMethods.delete:
        params = this.deleteMethod(req);
        break;
      case this.requestMethods.put:
      case this.requestMethods.post:
        params = this.postMethod(req);
        break;
    }

    return _.assign({}, this.defParams(req), params);
  }

  public handleRequest(cb: Function) {
    return (req: express.Request, res: express.Response) => {
      const params = this.parseParameters(req);
      const result = cb(params);

      result
        .then((response: express.Response) => res.send(response || null))
        .catch((err: Error) => handleError(err, res));
    };
  }
}

export const serviceHandler = new ServiceHandler();
export const handleRequest = serviceHandler.handleRequest.bind(serviceHandler);
