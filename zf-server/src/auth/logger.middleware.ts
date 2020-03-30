import {Inject, Injectable} from "@nestjs/common";
import {Logger} from "winston";

@Injectable()
export class LoggerMiddleware {
  constructor(
    @Inject('winston') private readonly logger: Logger,
  ) {}

  use(req, res, next) {
    this.logger.info(req.url);
    next();
  }
}
