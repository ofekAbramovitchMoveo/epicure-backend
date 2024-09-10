import * as mongoose from 'mongoose'
import { HydratedDocument } from "mongoose"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

import { Chef } from "../chef/chef.schema"
import { Dish } from "./dish.schema"

export type RestaurantDocument = HydratedDocument<Restaurant>

@Schema({ _id: false })
export class UserLocation {
    @Prop()
    lat: number

    @Prop()
    lng: number
}

@Schema()
export class Restaurant {
    @Prop({ required: true })
    name: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chef', autopopulate: true })
    chef: Chef

    @Prop({ required: true })
    rating: number

    @Prop({ default: 'imgs/claro.png' })
    imgUrl: string

    @Prop({ default: () => new Date().toISOString() })
    createdAt: string

    @Prop({ default: true })
    isOpenNow: boolean

    @Prop({
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        _id: false,
        coordinates: {
            type: [Number],
            required: true
        }
    })
    location: {
        type: string
        coordinates: number[]
    }

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }], autopopulate: true })
    dishes: Dish[]
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant)
RestaurantSchema.index({ location: '2dsphere' })