import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      session: express.Session & { code_verifier: string };
    }
  }
}

