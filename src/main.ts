import { ValidationPipe } from '@nestjs/common'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { NestFactory } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import * as compression from 'compression'

import { LoggerService } from './services/logger.service'
import { AppModule } from './app.module'
import { Restaurant } from './api/restaurant/restaurant.schema'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new LoggerService()
    })
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe())
    app.use(compression())
    const restaurantModel = app.get(getModelToken(Restaurant.name))
    await restaurantModel.collection.createIndex({ location: '2dsphere' })

    if (process.env.NODE_ENV !== 'production') {
        const corsOptions: CorsOptions = {
            origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
            credentials: true,
        }
        app.enableCors(corsOptions)
    }

    const port = process.env.PORT
    await app.listen(port, () => {
        const logger = app.get(LoggerService)
        logger.log('Server is running on port: ' + port)
    })
}
bootstrap()
