import { Schema } from 'mongoose'
import * as dayjs from 'dayjs'

export class DayjsSchemaType extends Schema.Types.Date {
    cast(val: any) {
        if (dayjs.isDayjs(val)) {
            return val.toDate()
        }
        return super.cast(val)
    }
}


declare module 'mongoose' {
    interface SchemaTypes {
        Dayjs: typeof DayjsSchemaType
    }
}