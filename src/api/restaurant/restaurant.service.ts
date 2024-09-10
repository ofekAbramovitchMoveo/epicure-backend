import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, PipelineStage } from "mongoose"

import { FilterBy } from "src/types/filter-by.type"
import { Dish } from "./dish.schema"
import { Restaurant } from "./restaurant.schema"

@Injectable()
export class RestaurantService {
    constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>) { }

    async getRestaurants(query: FilterBy): Promise<Restaurant[]> {
        const pipeline = await this.buildPipeline(query)
        return await this.restaurantModel.aggregate(pipeline)
    }

    async getRestaurantById(id: string): Promise<Restaurant> {
        return await this.restaurantModel.findById(id)
    }

    async getDishesByRestaurant(restaurantId?: string): Promise<Dish[]> {
        const restaurant = await this.restaurantModel.findById(restaurantId).populate('dishes')
        return restaurant?.dishes || []
    }

    async getSuggestions(searchStr: string): Promise<Restaurant[]> {
        if (!searchStr) return []
        return await this.restaurantModel.find({ name: { $regex: searchStr, $options: 'i' } })
    }

    private async buildPipeline(query: FilterBy): Promise<PipelineStage[]> {
        const pipeline: PipelineStage[] = []
        const basePath = '/restaurants/'

        if (query.userLocation && query.distance) {
            const maxDistance = Number(query.distance[1]) * 1000
            if (typeof query.userLocation !== 'string') {
                pipeline.push({
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [query.userLocation.lng, query.userLocation.lat]
                        },
                        distanceField: "distance",
                        maxDistance: maxDistance,
                        spherical: true,
                        distanceMultiplier: 0.001
                    }
                })
            }
        }
        if (query.path) {
            const sortAndLimitStages = (sortBy: string) => [
                { $sort: { [sortBy]: -1 as const } },
                { $limit: 3 }
            ]

            switch (query.path) {
                case `${basePath}new`:
                    pipeline.push(...sortAndLimitStages('createdAt'))
                    break;
                case `${basePath}most-popular`:
                    pipeline.push(...sortAndLimitStages('rating'))
                    break;
                case `${basePath}open-now`:
                    pipeline.push({ $match: { isOpenNow: true } })
                    break;
                case `${basePath}map`:
                default:
                    break;
            }
        }
        if (query.ratings?.length) {
            const ratings = Array.isArray(query.ratings) ? query.ratings : [query.ratings]
            const numericRatings = ratings.map(Number).filter(r => !isNaN(r))
            if (numericRatings.length) pipeline.push({ $match: { rating: { $in: numericRatings } } })
        }
        if (query.priceRange) {
            const [minPriceStr, maxPriceStr] = query.priceRange
            const minPrice = Number(minPriceStr)
            const maxPrice = Number(maxPriceStr)

            pipeline.push(
                {
                    $lookup: {
                        from: 'dishes',
                        localField: 'dishes',
                        foreignField: '_id',
                        as: 'dishes'
                    }
                },
                {
                    $match: {
                        dishes: {
                            $elemMatch: {
                                price: { $gte: minPrice, $lte: maxPrice }
                            }
                        }
                    }
                },
            )
        }

        if (!pipeline.some(stage => '$match' in stage)) {
            pipeline.unshift({ $match: {} })
        }
        if (!pipeline.some(stage => '$sort' in stage)) {
            pipeline.push({ $sort: { _id: 1 } })
        }

        return pipeline
    }
}