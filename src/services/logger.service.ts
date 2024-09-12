import * as fs from "fs"
import * as path from "path"
import { ConsoleLogger, Injectable, LogLevel } from "@nestjs/common"

type LogContext = {
    controller?: string
    method?: string
    params?: Record<string, any>
}

@Injectable()
export class LoggerService extends ConsoleLogger {
    private logsDir = './logs'
    private logFile = path.join(this.logsDir, 'backend.log')

    constructor() {
        super()
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir)
        }
    }

    private getTime(): string {
        const now = new Date()
        return now.toLocaleString('he')
    }

    private isError(e: any): boolean {
        return e && e.stack && e.message
    }

    protected formatContext(context: string | LogContext): string {
        if (typeof context === 'string') return context
        return JSON.stringify(context, null, 2)
    }

    private doLog(level: LogLevel, message: string, context?: string |LogContext, ...args: any[]): void {
        const contextStr = context ? `\nContext: ${this.formatContext(context)}` : '';
        const argsStr = args.length ? `\nAdditional args: ${args.map(arg => JSON.stringify(arg, null, 2)).join(', ')}` : '';

        const line = `${this.getTime()} - ${level.toUpperCase()} - ${message}${contextStr}${argsStr}\n`;
        console.log(line);
        fs.appendFile(this.logFile, line, err => {
            if (err) console.log('FATAL: cannot write to log file');
        });
    }

    debug(msg: any, context?: string | LogContext, ...args: any[]): void {
        if (process.env.NODE_ENV === 'production') return
        this.doLog('debug', msg, context, ...args)
        super.debug(msg, ...args)
    }

    info(msg: any, context?: string | LogContext, ...args: any[]): void {
        this.doLog('log', msg, context, ...args)
        super.log(msg, ...args)
    }

    warn(msg: any, context?: string | LogContext, ...args: any[]): void {
        this.doLog('warn', msg, context, ...args)
        super.warn(msg, ...args)
    }

    error(msg: any, context?: string | LogContext, ...args: any[]): void {
        this.doLog('error', msg, context, ...args)
        super.error(msg, ...args)
    }
}