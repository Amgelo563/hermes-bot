import { mkdirSync } from 'fs';
import { appendFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
// @ts-expect-error tslog doesn't support cjs, see https://github.com/fullstack-build/tslog/issues/267
import { Logger } from 'tslog';
import { ZodError } from 'zod';
import { HermesConfigReader } from './config/file/HermesConfigReader';
import type { HermesConfig } from './config/file/HermesConfigSchema';
import type { HermesConfigWrapper } from './config/file/HermesConfigWrapper';
import { HermesDatabaseService } from './hermes/database/HermesDatabaseService';
import { HermesMessageService } from './hermes/message/HermesMessageService';
import { HermesService } from './HermesService';
import { ZodErrorFormatter } from './zod/ZodErrorFormatter';

class Main {
  public async start() {
    const logger = new Logger({ type: 'pretty' });
    logger.info('Starting...');

    const configWrapper = await this.loadConfig(logger);
    const config = configWrapper.getConfig();

    if (config.general.saveLogs) {
      await this.setupLogs(logger);
    }
    logger.settings.minLevel = config.general.debug ? 0 : 3;

    const messages = await this.setupMessageService(config, logger);
    const database = await this.setupDatabaseService(logger);

    const hermes = HermesService.create(
      logger,
      configWrapper,
      messages,
      database,
    );

    logger.debug('Starting main Hermes service...');
    try {
      await hermes.start();
    } catch (e) {
      logger.fatal('Failed to start Hermes service, exiting', e);
      process.exit(1);
    }

    logger.info('Started!');
  }

  protected async loadConfig(
    logger: Logger<unknown>,
  ): Promise<HermesConfigWrapper> {
    const reader = new HermesConfigReader();
    let config;

    try {
      logger.debug('Loading config file...');
      config = await reader.readAndWrap();
      logger.debug('Config loaded');
    } catch (e) {
      logger.fatal('Failed to load config file, exiting');
      if (e instanceof ZodError) {
        logger.fatal(ZodErrorFormatter.format(e));
      } else {
        logger.fatal(e);
      }

      process.exit(1);
    }

    return config;
  }

  protected async setupMessageService(
    config: HermesConfig,
    logger: Logger<unknown>,
  ): Promise<HermesMessageService> {
    const messages = HermesMessageService.create(config, logger);

    try {
      logger.debug('Loading messages service...');
      await messages.start();
      logger.debug('Messages service loaded and messages loaded');
    } catch (e) {
      logger.fatal('Failed to load messages service, exiting');
      if (e instanceof ZodError) {
        logger.fatal(ZodErrorFormatter.format(e));
      } else {
        logger.fatal(e);
      }

      process.exit(1);
    }

    return messages;
  }

  protected async setupDatabaseService(
    logger: Logger<unknown>,
  ): Promise<HermesDatabaseService> {
    const database = HermesDatabaseService.create();

    try {
      logger.debug('Loading database service...');
      await database.start();
      logger.debug('Database service loaded');
    } catch (e) {
      logger.fatal('Failed to load database service, exiting', e);
      process.exit(1);
    }

    return database;
  }

  protected async setupLogs(logger: Logger<unknown>): Promise<void> {
    logger.debug('Saving logs is enabled, setting up log transport...');

    mkdirSync('./logs', { recursive: true });
    const filePath = path.resolve(
      __dirname,
      '..',
      'logs',
      `${new Date().toISOString().replace(/:/g, '-')}.log`,
    );

    await writeFile(filePath, '', { encoding: 'utf8' });

    logger.attachTransport((logObj) => {
      delete logObj._meta;

      const line = Array.isArray(logObj)
        ? logObj.join(' ')
        : JSON.stringify(logObj);

      appendFileSync(filePath, line + '\n');
    });

    logger.debug('Logs transport attached');
  }
}

void new Main().start();
