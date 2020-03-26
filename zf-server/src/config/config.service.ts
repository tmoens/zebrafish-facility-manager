import * as dotenv from 'dotenv';
import * as Joi from '@hapi/joi';
import * as fs from 'fs';
import {TypeOrmOptionsFactory, TypeOrmModuleOptions} from '@nestjs/typeorm';
import {LoggerOptions} from 'typeorm/logger/LoggerOptions';

export interface EnvConfig {
  [prop: string]: string;
}

class FacilityDTO {
  name: string;
  short_name: string;
  prefix: string;
}

export class ConfigService implements TypeOrmOptionsFactory {
  private readonly envConfig: EnvConfig;
  readonly facility: string; // which facility are we talking about

  constructor() {
    this.facility = process.env.FACILITY;

    if (!this.facility) {
      this.facility = 'test';
    }

    const filePath = `environments/${this.facility}.env`;
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = ConfigService.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private static validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string().default('production'),

      FACILITY_ORG_NAME: Joi.string().required(),
      FACILITY_ORG_SHORT_NAME: Joi.string().required(),
      FACILITY_ORG_PREFIX: Joi.string().required(),

      PORT: Joi.number().required(),

      DB_NAME: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),

      TYPEORM_SYNC_DATABASE: Joi.boolean().default(false),
      TYPEORM_LOG_QUERIES: Joi.boolean().default(false),

      JWT_SECRET: Joi.string().required(),
      JWT_DURATION: Joi.string().required(),

    });

    const {error, value: validatedEnvConfig} = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get typeORMLogQueries(): boolean {
    return Boolean(this.envConfig.TYPEORM_LOG_QUERIES);
  }

  get typeORMSync(): boolean {
    return Boolean(this.envConfig.TYPEORM_SYNC_DATABASE);
  }

  get facilityInfo(): FacilityDTO {
    return {
      name: this.envConfig.FACILITY_ORG_NAME,
      short_name: this.envConfig.FACILITY_ORG_SHORT_NAME,
      prefix: this.envConfig.FACILITY_ORG_PREFIX,
    };
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get jwtDuration(): string {
    return this.envConfig.JWT_DURATION;
  }

  // This is used to build ORM configuration options
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const SOURCE_PATH = this.nodeEnv === 'production' ? 'dist' : 'src';

    const loggingOption: LoggerOptions = ['error'];
    if (this.typeORMLogQueries) {
      loggingOption.push('query');
    }

    // TODO specify entities based on production (js) or development (ts)
    return {
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: this.envConfig.DB_USER,
      password: this.envConfig.DB_PASSWORD,
      database: this.envConfig.DB_NAME,
      entities: [
        `${SOURCE_PATH}/**/*.entity{.ts,.js}`,
      ],
      synchronize: this.typeORMSync,
      logging: loggingOption,
    };
  }
}
