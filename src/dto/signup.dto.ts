import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"

export class SignupDto {
    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsString()
    @IsNotEmpty()
    address: string

    @IsPhoneNumber('IL')
    @IsNotEmpty()
    phone: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}