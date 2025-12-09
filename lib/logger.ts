type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 50;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: this.formatTimestamp(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isDevelopment) {
      const prefix = `[${level}] ${entry.timestamp}`;
      switch (level) {
        case 'DEBUG':
          console.log(prefix, message, data || '');
          break;
        case 'INFO':
          console.info(prefix, message, data || '');
          break;
        case 'WARN':
          console.warn(prefix, message, data || '');
          break;
        case 'ERROR':
          console.error(prefix, message, data || '');
          break;
      }
    }
  }

  debug(message: string, data?: any) {
    this.addLog('DEBUG', message, data);
  }

  info(message: string, data?: any) {
    this.addLog('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.addLog('WARN', message, data);
  }

  error(message: string, error?: any) {
    this.addLog('ERROR', message, error);
  }

  query(table: string, action: string, ms: number, data?: any) {
    const message = `${table}.${action} (${ms}ms)`;
    this.addLog('INFO', `[DB] ${message}`, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();


