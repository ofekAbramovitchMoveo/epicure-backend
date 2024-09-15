import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { compare, hash } from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { UserService } from '../user/user.service'
import { LoginDto } from 'src/dto/login.dto'
import { SignupDto } from 'src/dto/signup.dto'
import { User } from '../user/user.schema'

@Injectable()
export class AuthService {
    constructor(private userService: UserService) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto

        const user = await this.userService.getUserByEmail(email)
        if (!user) throw new UnauthorizedException('No user exists with this email')

        const match = await compare(password, user.password)
        if (!match) throw new UnauthorizedException('Invalid password')

        delete user.password
        return user
    }

    async signup(signupDto: SignupDto) {
        const saltOrRounds = 10
        const { email, password, fullName, address, phone } = signupDto
        if (!email || !password || !fullName || !address || !phone) throw new BadRequestException('Missing fields')

        const user = await this.userService.getUserByEmail(email)
        if (user) throw new BadRequestException('Email already taken')

        const hashedPassword = await hash(password, saltOrRounds)
        return this.userService.add({ email, password: hashedPassword, fullName, address, phone })
    }

    getLoginToken(user: User) {
        const userInfo = {
            fullName: user.fullName,
            email: user.email,
        }
        return jwt.sign(userInfo, process.env.JWT_SECRET, { expiresIn: '1h' })
    }

    validateToken(loginToken: string) {
        return jwt.verify(loginToken, process.env.JWT_SECRET)
    }
}
