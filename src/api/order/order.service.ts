import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { OrderDto } from 'src/dto/order.dto'
import { Order } from './order.schema'

@Injectable()
export class OrderService {
    constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

    async placeOrder(orderDto: OrderDto) {
        const { paymentDetails } = orderDto
        delete paymentDetails.cardNumber
        delete paymentDetails.cvv

        return this.orderModel.create(orderDto)
    }
}
