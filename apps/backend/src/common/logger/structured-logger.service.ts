import { Injectable, LoggerService } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextStore {
  correlationId: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContextStore>();

export interface StructuredLogEntry {
  timestamp: string;
  level: string;
  context?: string;
  message: string;
  correlationId?: string;
  trace?: string;
  [key: string]: any;
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private isProduction: boolean;
  private logLevel: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug');
  }

  setIsProduction(isProd: boolean) {
    this.isProduction = isProd;
  }

  setLogLevel(level: string) {
    this.logLevel = level;
  }

  shouldLog(level: string): boolean {
    const levels = ['debug', 'verbose', 'info', 'warn', 'error'];
    const currentIdx = levels.indexOf(this.logLevel.toLowerCase());
    const targetIdx = levels.indexOf(level.toLowerCase());
    return targetIdx >= (currentIdx === -1 ? 2 : currentIdx);
  }

  formatEntry(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ): StructuredLogEntry {
    const store = requestContextStorage.getStore();
    const correlationId = store?.correlationId;

    let formattedMessage = '';
    if (typeof message === 'object' && message !== null) {
      try {
        formattedMessage = JSON.stringify(message);
      } catch {
        formattedMessage = String(message);
      }
    } else {
      formattedMessage = String(message);
    }

    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: formattedMessage,
    };

    if (context) entry.context = context;
    if (correlationId) entry.correlationId = correlationId;
    if (trace) entry.trace = trace;

    return entry;
  }

  log(message: any, context?: string) {
    if (!this.shouldLog('info')) return;
    const entry = this.formatEntry('INFO', message, context);
    this.output(entry);
  }

  error(message: any, trace?: string, context?: string) {
    if (!this.shouldLog('error')) return;
    const entry = this.formatEntry('ERROR', message, context, trace);
    this.output(entry, true);
  }

  warn(message: any, context?: string) {
    if (!this.shouldLog('warn')) return;
    const entry = this.formatEntry('WARN', message, context);
    this.output(entry);
  }

  debug(message: any, context?: string) {
    if (!this.shouldLog('debug')) return;
    const entry = this.formatEntry('DEBUG', message, context);
    this.output(entry);
  }

  verbose(message: any, context?: string) {
    if (!this.shouldLog('verbose')) return;
    const entry = this.formatEntry('VERBOSE', message, context);
    this.output(entry);
  }

  private output(entry: StructuredLogEntry, isError = false) {
    if (this.isProduction) {
      const line = JSON.stringify(entry);
      if (isError) {
        process.stderr.write(`${line}\n`);
      } else {
        process.stdout.write(`${line}\n`);
      }
    } else {
      const ctx = entry.context ? `[${entry.context}] ` : '';
      const corr = entry.correlationId ? `(${entry.correlationId}) ` : '';
      const line = `[${entry.timestamp}] ${entry.level.padEnd(5)} ${corr}${ctx}${entry.message}`;
      if (isError) {
        console.error(line, entry.trace || '');
      } else {
        console.log(line);
      }
    }
  }
}
