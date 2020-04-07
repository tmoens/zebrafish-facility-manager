import {Inject, Injectable} from "@nestjs/common";
import {Request, Response} from 'express';
import {Logger} from "winston";

@Injectable()
export class LoggerMiddleware {
  constructor(
    @Inject('winston') private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next) {
    next();
  }
}
