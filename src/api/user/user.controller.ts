import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common'

import { UserService } from './user.service'
import { LoggerService } from 'src/services/logger.service'
import { User } from './user.schema'

@Controller('user')
export class UserController {
    constructor(private userService: UserService, private readonly logger: LoggerService) { }

    private initLogger(methodName: string, params?: Record<string, string[] | string | number | number[]>) {
        const logContext = {
            controller: this.constructor.name,
            method: methodName,
            params
        }

        return {
            info: (message: string) => this.logger.info(message, logContext),
            debug: (message: string) => this.logger.debug(message, logContext),
            error: (message: string, error?: any) => this.logger.error(message, logContext, error),
            warn: (message: string) => this.logger.warn(message, logContext)
        }
    }

    @Get()
    async getUsers(): Promise<User[]> {
        const logger = this.initLogger(this.getUsers.name)

        try {
            return await this.userService.getUsers()
        } catch (err) {
            logger.error('Error fetching users', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<User> {
        const logger = this.initLogger(this.getUserById.name, { id })

        try {
            return await this.userService.getUserById(id)
        } catch (err) {
            logger.error('Error fetching user by id', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}