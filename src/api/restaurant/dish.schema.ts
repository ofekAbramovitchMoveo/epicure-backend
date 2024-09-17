import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose'
import { HydratedDocument } from "mongoose"

import { Restaurant } from "./restaurant.schema"

export type DishDocument = HydratedDocument<Dish>
export type BagDishDocument = HydratedDocument<BagDish>

@Schema()
export class Dish {

    @Prop()
    name: string

    @Prop()
    iconUrl: string

    @Prop()
    ingredients: string[]

    @Prop()
    price: number

    @Prop()
    imgUrl: string

    @Prop()
    isSignature: boolean

    @Prop()
    type: string

    @Prop({
        type: {
            sideDish: [String],
            changes: [String]
        },
        _id: false
    })
    options: {
        sideDish: string[],
        changes: string[]
    }

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
    restaurant: Restaurant
}

@Schema({ _id: false,  })
export class BagDish extends Dish {
    @Prop()
    bagId?: string

    @Prop()
    restaurantName?: string

    @Prop()
    changes?: string[]

    @Prop()
    sideDish?: string

    @Prop()
    quantity?: number
}

export const DishSchema = SchemaFactory.createForClass(Dish)
export const BagDishSchema = SchemaFactory.createForClass(BagDish)