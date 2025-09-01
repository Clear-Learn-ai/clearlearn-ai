import winston from 'winston';

export class Logger {
  private logger: winston.Logger;
  private component: string;

  constructor(component: string) {
    this.component = component;
    
    const logLevel = process.env.LOG_LEVEL || 'info';
    
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const logMessage = `${timestamp} [${this.component}] ${level.toUpperCase()}: ${message}`;
          return stack ? `${logMessage}\n${stack}` : logMessage;
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, stack }) => {
              const logMessage = `${timestamp} [${this.component}] ${level}: ${message}`;
              return stack ? `${logMessage}\n${stack}` : logMessage;
            })
          ),
        }),
        new winston.transports.File({
          filename: 'mcp-server.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: any): void {
    if (error instanceof Error) {
      this.logger.error(message, { stack: error.stack, message: error.message });
    } else {
      this.logger.error(message, error);
    }
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}