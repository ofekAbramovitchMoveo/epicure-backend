import { Controller, Get, HttpException, HttpStatus, Param, Put, Query } from '@nestjs/common'

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
    async getChefs(@Query() query: { sortBy: string | null, limit: string | null, page?: string }): Promise<{ chefs: Chef[], totalCount: number }> {
        const logger = this.initLogger(this.getChefs.name, query)
        logger.debug('Fetching chefs')

        try {
            let pageNum: number | undefined
            if (query.page) {
                const parsedPage = parseInt(query.page, 10)
                pageNum = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : undefined
            }

            return await this.chefService.getChefs(query, pageNum)
        } catch (err) {
            logger.error('Error fetching chefs', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':id')
    async getChefById(@Param('id') id: string): Promise<Chef> {
        const logger = this.initLogger(this.getChefById.name, { id })

        try {
            return await this.chefService.getChefById(id)
        } catch (err) {
            logger.error('Error fetching chef by id', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Put(':id/view')
    async incrementChefView(@Param('id') id: string) {
        const logger = this.initLogger(this.incrementChefView.name, { id })

        try {
            return await this.chefService.incrementChefView(id)
        } catch (err) {
            logger.error('Error incrementing chef view', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
