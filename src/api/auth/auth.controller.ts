import { Body, Controller, HttpException, HttpStatus, Post, Res } from '@nestjs/common'

import { AuthService } from './auth.service'
import { LoggerService } from 'src/services/logger.service'
import { LoginDto } from 'src/dto/login.dto'
import { Response } from 'express'
import { SignupDto } from 'src/dto/signup.dto'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private readonly logger: LoggerService) { }

    private initLogger(methodName: string, params?: Record<string, LoginDto | SignupDto>) {
        const logContext = {
            controller: this.constructor.name,
            method: methodName,
            params
        }

        return {
            info: (message: string) => this.logger.info(message, logContext),
            debug: (message: string) => this.logger.debug(message, logContext),
            error: (message: string, error?: any) => this.logger.error(message, logContext, error),
            warn: (message: string) => this.logger.warn(message, logContext)
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const logger = this.initLogger(this.login.name)
        logger.debug(`auth.controller - login with email: ${loginDto.email}`)

        try {
            const user = await this.authService.login(loginDto)
            const loginToken = this.authService.getLoginToken(user)
            logger.info(`user login: ${user}`)
            res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true })
            res.json(user)
        } catch (err) {
            logger.error('Error logging in', err)
            throw new HttpException(err.message, err.status || HttpStatus.UNAUTHORIZED)
        }
    }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
        const logger = this.initLogger(this.signup.name)
        logger.debug(`auth.controller - signup with email: ${signupDto.email}, fullName: ${signupDto.fullName}`)

        try {
            const account = await this.authService.signup(signupDto)
            logger.debug(`account created: ${JSON.stringify(account)}`)

            const user = await this.authService.login({ email: signupDto.email, password: signupDto.password })
            logger.info(`user signup: ${user}`)
            const loginToken = this.authService.getLoginToken(user)
            res.cookie('loginToken', loginToken, { sameSite: 'none', secure: true })
            res.json(user)
        } catch (err) {
            logger.error('Error signing up', err)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Post('logout')
    async logout(@Res() res: Response) {
        try {
            res.clearCookie('loginToken')
            res.sendStatus(HttpStatus.OK)
        } catch (err) {
            res.sendStatus(err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
