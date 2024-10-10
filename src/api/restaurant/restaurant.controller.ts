import { Controller, Get, HttpException, HttpStatus, Param, Query } from "@nestjs/common"

import { FilterBy } from "src/types/filter-by.type"
import { LoggerService } from "src/services/logger.service"
import { Dish } from "./dish.schema"
import { Restaurant, UserLocation } from "./restaurant.schema"
import { RestaurantService } from "./restaurant.service"

@Controller('restaurant')
export class RestaurantController {
    constructor(private restaurantService: RestaurantService, private readonly logger: LoggerService) { }

    private initLogger(methodName: string, params?: FilterBy | Record<string, string[] | string | number | number[]>) {
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

    @Get('suggestions')
    async getSuggestions(@Query() query: { search: string }): Promise<Restaurant[]> {
        const logger = this.initLogger(this.getSuggestions.name, query)

        try {
            return await this.restaurantService.getSuggestions(query.search)
        } catch (err) {
            logger.error('Error fetching suggestions', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get()
    async getRestaurants(@Query() query: FilterBy, @Query('page') page?: string): Promise<{ restaurants: Restaurant[], totalCount: number }> {
        const logger = this.initLogger(this.getRestaurants.name, query)
        logger.debug('Fetching restarurants')

        try {
            query.userLocation = query.userLocation && JSON.parse(query.userLocation as string) as UserLocation

            let pageNum: number | undefined
            if (page) {
                const parsedPage = parseInt(page, 10)
                pageNum = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : undefined
            }

            return await this.restaurantService.getRestaurants(query, pageNum)
        } catch (err) {
            logger.error('Error fetching restaurants', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':id')
    async getRestaurantById(@Param('id') id: string): Promise<Restaurant> {
        const logger = this.initLogger(this.getRestaurantById.name, { id })

        try {
            return await this.restaurantService.getRestaurantById(id)
        } catch (err) {
            logger.error('Error fetching restaurant by id', err.errmsg)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':restaurantId/dish')
    async getDishesByRestaurant(@Param('restaurantId') restaurantId?: string): Promise<Dish[]> {
        const logger = this.initLogger(this.getDishesByRestaurant.name, { restaurantId })

        try {
            return await this.restaurantService.getDishesByRestaurant(restaurantId)
        } catch (err) {
            logger.error('Error fetching dishes by restaurant', err)
            throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}