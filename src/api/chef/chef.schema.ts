import * as mongoose from 'mongoose'
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

import { Restaurant } from "../restaurant/restaurant.schema"

export type ChefDocument = HydratedDocument<Chef>

@Schema()
export class Chef {

    @Prop()
    name: string

    @Prop()
    imgUrl: string

    @Prop()
    isChefOfTheWeek: boolean

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }] })
    restaurantsIds: Restaurant[]
}

export const ChefSchema = SchemaFactory.createForClass(Chef)