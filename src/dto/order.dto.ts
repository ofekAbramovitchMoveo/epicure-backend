import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsCreditCard, IsDate, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, Length, ValidateNested } from "class-validator"
import { Dayjs } from 'dayjs'
import { ObjectId } from "mongodb"

class DeliveryDetailsDto {
    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsString()
    @IsNotEmpty()
    address: string

    @IsPhoneNumber('IL')
    @IsNotEmpty()
    phone: string
}

class PaymentDetailsDto {
    @IsString()
    @IsNotEmpty()
    @IsCreditCard({ message: 'Please enter a valid credit card number' })
    cardNumber: string

    @IsString()
    @IsNotEmpty()
    nameOnCard: string

    @IsString()
    @IsNotEmpty()
    @Length(3, 3, { message: 'CVV must be 3 digits' })
    cvv: string

    @IsNotEmpty()
    @IsDateString()
    expiryDate: Dayjs | null
}

class BagDishDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    iconUrl: string

    @IsArray()
    @IsString({ each: true })
    ingredients: string[]

    @IsNumber()
    @IsNotEmpty()
    price: number

    @IsString()
    @IsNotEmpty()
    imgUrl: string

    @IsBoolean()
    isSignature: boolean

    @IsString()
    @IsNotEmpty()
    type: string

    @IsObject()
    @IsNotEmpty()
    options: {
        sideDish: string[],
        changes: string[]
    }

    @IsNotEmpty()
    @IsMongoId()
    restaurant: ObjectId

    @IsOptional()
    @IsString()
    bagId?: string

    @IsOptional()
    @IsString()
    restaurantName?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    changes?: string[]

    @IsOptional()
    @IsString()
    sideDish?: string

    @IsOptional()
    @IsNumber()
    quantity?: number
}

export class OrderDto {
    @ValidateNested()
    @Type(() => DeliveryDetailsDto)
    deliveryDetails: DeliveryDetailsDto

    @ValidateNested()
    @Type(() => PaymentDetailsDto)
    paymentDetails: PaymentDetailsDto

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BagDishDto)
    bag: BagDishDto[]

    @IsNumber()
    @IsNotEmpty()
    totalPrice: number

    @IsOptional()
    @IsDate()
    createdAt?: Date
}