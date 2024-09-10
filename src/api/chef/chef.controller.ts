import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common'

import { LoggerService } from 'src/services/logger.service'
import { Chef } from './chef.schema'
import { ChefService } from './chef.service'

@Controller('chef')
export class ChefController {
    constructor(private chefService: ChefService, private readonly logger: LoggerService) { }

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
    async getChefs(): Promise<Chef[]> {
        const logger = this.initLogger(this.getChefs.name)
        logger.debug('Fetching chefs')

        try {
            return await this.chefService.getChefs()
        } catch (err) {
            logger.error('Error fetching chefs', err)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':id')
    async getChefById(@Param('id') id: string): Promise<Chef> {
        const logger = this.initLogger(this.getChefById.name, { id })

        try {
            return await this.chefService.getChefById(id)
        } catch (err) {
            logger.error('Error fetching chef by id', err)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
