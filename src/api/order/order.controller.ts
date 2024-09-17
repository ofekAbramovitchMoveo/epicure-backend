import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common'
import { Types } from 'mongoose'

import { LoggerService } from 'src/services/logger.service'
import { OrderService } from './order.service'
import { OrderDto } from 'src/dto/order.dto'

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService, private readonly logger: LoggerService) { }

    private initLogger(methodName: string, params?: Record<string, any>) {
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

    @Post()
    async placeOrder(@Body() orderDto: OrderDto) {
        const logger = this.initLogger(this.placeOrder.name, { orderDto })
        logger.debug(`Placing order: ${JSON.stringify(orderDto, null, 2)}`)

        try {
            return await this.orderService.placeOrder(orderDto)
        } catch (err) {
            logger.error('Error placing order', err)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('user/:userId')
    async getOrders(@Param('userId') userId: Types.ObjectId) {
        const logger = this.initLogger(this.getOrders.name)
        logger.debug('Fetching orders')

        try {
            return await this.orderService.getOrders(userId)
        } catch (err) {
            logger.error('Error fetching orders', err)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
