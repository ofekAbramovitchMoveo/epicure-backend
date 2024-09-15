import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
    @Prop({ required: true })
    email: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true })
    fullName: string

    @Prop({ required: true })
    address: string

    @Prop({ required: true })
    phone: string
}

export const UserSchema = SchemaFactory.createForClass(User)
