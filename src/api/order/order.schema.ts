import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { Dayjs } from 'dayjs'

import { BagDish, BagDishSchema } from "../restaurant/dish.schema"
import { DayjsSchemaType } from "../../services/dayjs.schema-type"

export type OrderDocument = HydratedDocument<Order>

@Schema({ _id: false })
class DeliveryDetails {
    @Prop({ required: true })
    fullName: string

    @Prop({ required: true })
    address: string

    @Prop({ required: true })
    phone: string
}


@Schema({ _id: false })
class PaymentDetails {
    @Prop({ required: true })
    nameOnCard: string

    @Prop({ required: true, type: DayjsSchemaType })
    expiryDate: Dayjs | null
}

@Schema()
export class Order {
    @Prop({ required: true, type: DeliveryDetails })
    deliveryDetails: DeliveryDetails

    @Prop({ required: true, type: PaymentDetails })
    paymentDetails: PaymentDetails

    @Prop({ required: true, type: [BagDishSchema] })
    bag: BagDish[]

    @Prop({ required: true })
    totalPrice: number

    @Prop({ default: Date.now })
    createdAt?: Date
}

export const OrderSchema = SchemaFactory.createForClass(Order)
