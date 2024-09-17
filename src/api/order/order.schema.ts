import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose'
import { HydratedDocument } from "mongoose"
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'

import { BagDish, BagDishSchema } from "../restaurant/dish.schema"
import { DayjsSchemaType } from "../../services/dayjs.schema-type"
import { User } from "../user/user.schema"

dayjs?.extend(utc)
dayjs?.extend(timezone)

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
    expiryDate: dayjs.Dayjs | null
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

    @Prop({
        type: DayjsSchemaType,
        default: () => dayjs().tz('Asia/Jerusalem').toDate(),
        transform: (val: Date) => dayjs(val).tz('Asia/Jerusalem').toDate()
    })
    createdAt?: Date

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: User
}

export const OrderSchema = SchemaFactory.createForClass(Order)
