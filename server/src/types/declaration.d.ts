
import { Request } from "express";

/**
 * This file is used to declare global types for the application.
 * It is used to extend the Express Request object with a new property `file`.
 */

declare global {

  namespace Express {

    interface Request {

      file?: Express.Multer.File;

    }

  }

}
