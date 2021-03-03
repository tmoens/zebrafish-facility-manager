import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {LoggerOptions} from 'typeorm/logger/LoggerOptions';
import {MailerOptions, MailerOptionsFactory} from "@nestjs-modules/mailer";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import {ClientConfig} from '../common/config/client-config';

export interface EnvConfig {
  [prop: string]: string;
}

class FacilityDto {
  name: string;
  short_name: string;
  prefix: string;
  url: string;
}

export class ConfigService implements MailerOptionsFactory, TypeOrmOptionsFactory {
  private readonly envConfig: EnvConfig;
  readonly facility: string; // which facility are we talking about

  constructor() {
    this.facility = process.env.FACILITY;

    if (!this.facility) {
      throw new Error("You must set a FACILITY environment variable before running the" +
        " Zebrafish Facility Management server. export FACILITY=some_facility_identifier" +
        "  The system will then look for the server's configuration file in the file" +
        " environments/some_facility_identifier.env")
    }

    const filePath = `environments/${this.facility}.env`;
    if (!fs.existsSync(filePath)) {
      throw new Error(`You have set the FACILITY to ${this.facility}, but
      the expected configuration file was not found at ${filePath}`);
    }
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = ConfigService.validateInput(config);
  }

  get bestPracticesSite(): string {
    return this.envConfig.BEST_PARACTICES_SITE;
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

  get facilityInfo(): FacilityDto {
    return {
      name: this.envConfig.FACILITY_NAME,
      short_name: this.envConfig.FACILITY_SHORT_NAME,
      prefix: this.envConfig.FACILITY_PREFIX,
      url: this.envConfig.FACILITY_URL,
    };
  }

  // This is so the system can set up a default admin user
  get defaultAdminUserName(): string {
    return this.envConfig.DEFAULT_ADMIN_USER_NAME;
  }

  get defaultAdminUserEmail(): string {
    return this.envConfig.DEFAULT_ADMIN_USER_EMAIL;
  }

  get defaultAdminUserPassword(): string {
    return this.envConfig.DEFAULT_ADMIN_USER_PASSWORD;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get jwtDuration(): string {
    return this.envConfig.JWT_DURATION;
  }

  get gmailSender(): string {
    return this.envConfig.GMAIL_SENDER;
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private static validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string().default('production'),

      FACILITY_NAME: Joi.string().required(),
      FACILITY_SHORT_NAME: Joi.string().required(),
      FACILITY_PREFIX: Joi.string().required(),
      FACILITY_URL: Joi.string().required(),

      PORT: Joi.number().required(),

      DB_NAME: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),

      TYPEORM_SYNC_DATABASE: Joi.boolean().default(true),
      TYPEORM_LOG_QUERIES: Joi.boolean().default(false),

      JWT_SECRET: Joi.string().required(),
      JWT_DURATION: Joi.string().required(),

      GMAIL_SENDER: Joi.string().required(),
      GMAIL_PASSWORD: Joi.string().required(),

      DEFAULT_ADMIN_USER_NAME: Joi.string().required(),
      DEFAULT_ADMIN_USER_EMAIL: Joi.string().required(),
      DEFAULT_ADMIN_USER_PASSWORD: Joi.string().required(),

      BEST_PRACTICES_SITE: Joi.string().default('https://zebrafishfacilitymanager.com'),

      HIDE_PRIMARY_INVESTIGATOR: Joi.boolean().default(false),
      TANK_NUMBERING_HINT: Joi.string().default('Tank numbering hint not configured'),
      LABEL_FONT_SIZE: Joi.number().default(11),
      LABEL_FONT_FAMILY: Joi.string().default('Helvetica'),
      LABEL_HEIGHT_IN_INCHES: Joi.number().default(1.25),
      LABEL_WIDTH_IN_INCHES: Joi.number().default(3.5),
      LABEL_SHOW_QR_CODE: Joi.boolean().default(true),
      LABEL_SHOW_STOCK_NUMBER: Joi.boolean().default(true),
      LABEL_SHOW_PRIMARY_INVESTIGATOR_NAME: Joi.boolean().default(false),
      LABEL_SHOW_PRIMARY_INVESTIGATOR_INITIALS: Joi.boolean().default(true),
      LABEL_SHOW_RESEARCHER_NAME: Joi.boolean().default(true),
      LABEL_SHOW_RESEARCHER_INITIALS: Joi.boolean().default(false),
      LABEL_SHOW_FERTILIZATION_DATE: Joi.boolean().default(true),
      LABEL_SHOW_DESCRIPTION: Joi.boolean().default(true),
      LABEL_SHOW_MUTATIONS: Joi.boolean().default(true),
      LABEL_SHOW_TRANSGENES: Joi.boolean().default(true),
      LABEL_SHOW_ADDITIONAL_NOTES: Joi.boolean().default(true),
    });

    const {error, value: validatedEnvConfig} = envVarsSchema.validate(
      envConfig,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
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

  // This is used to build ORM configuration options
  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      defaults: {
        from:'"Zebrafish Facility Manager" <zebrafishfacilitymanager@gmail.com>'
      },
      transport: 'smtps://' + this.envConfig.GMAIL_SENDER + ':' + this.envConfig.GMAIL_PASSWORD + '@smtp.gmail.com',
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }
  }

  // This is used to build a ClientConfig object to send to the client
  get clientConfig(): ClientConfig {
    const c = new ClientConfig();
    c.facilityName = this.envConfig.FACILITY_NAME;
    c.facilityAbbrv = this.envConfig.FACILITY_SHORT_NAME;
    c.hidePI = Boolean(this.envConfig.HIDE_PRIMARY_INVESTIGATOR);
    c.tankNumberingHint = this.envConfig.TANK_NUMBERING_HINT;
    c.labelPrinting.fontPointSize = Number(this.envConfig.LABEL_FONT_SIZE);
    c.labelPrinting.fontFamily = this.envConfig.LABEL_FONT_FAMILY;
    c.labelPrinting.heightInInches = Number(this.envConfig.LABEL_HEIGHT_IN_INCHES);
    c.labelPrinting.widthInInches = Number(this.envConfig.LABEL_WIDTH_IN_INCHES);
    c.tankLabel.showQrCode = Boolean(this.envConfig.LABEL_SHOW_QR_CODE);
    c.tankLabel.showStockNumber = Boolean(this.envConfig.LABEL_SHOW_STOCK_NUMBER);
    c.tankLabel.showPiName = Boolean(this.envConfig.LABEL_SHOW_PRIMARY_INVESTIGATOR_NAME);
    c.tankLabel.showPiInitials = Boolean(this.envConfig.LABEL_SHOW_PRIMARY_INVESTIGATOR_INITIALS);
    c.tankLabel.showResearcherName= Boolean(this.envConfig.LABEL_SHOW_RESEARCHER_NAME);
    c.tankLabel.showResearcherInitials = Boolean(this.envConfig.LABEL_SHOW_RESEARCHER_INITIALS);
    c.tankLabel.showFertilizationDate = Boolean(this.envConfig.LABEL_SHOW_FERTILIZATION_DATE);
    c.tankLabel.showDescription = Boolean(this.envConfig.LABEL_SHOW_DESCRIPTION);
    c.tankLabel.showMutations = Boolean(this.envConfig.LABEL_SHOW_MUTATIONS);
    c.tankLabel.showTransgenes = Boolean(this.envConfig.LABEL_SHOW_TRANSGENES);
    c.tankLabel.showAdditionalNote = Boolean(this.envConfig.LABEL_SHOW_ADDITIONAL_NOTES);
    return c;
  }
}
