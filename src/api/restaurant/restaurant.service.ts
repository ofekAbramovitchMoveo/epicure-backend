import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, PipelineStage } from "mongoose"

import { FilterBy } from "src/types/filter-by.type"
import { Dish } from "./dish.schema"
import { Restaurant } from "./restaurant.schema"

@Injectable()
export class RestaurantService {
    constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>) { }

    async getRestaurants(query: FilterBy, page?: number): Promise<{ restaurants: Restaurant[], totalCount: number }> {
        const limit = 6
        const { pipeline, countPipeline } = this.buildPipeline(query, page, limit)

        const [restaurants, total] = await Promise.all([
            this.restaurantModel.aggregate(pipeline),
            this.restaurantModel.aggregate(countPipeline)
        ])

        const totalCount = total[0]?.total || 0

        return { restaurants, totalCount }
    }

    async getRestaurantById(id: string): Promise<Restaurant> {
        return await this.restaurantModel.findById(id)
    }

    async getDishesByRestaurant(restaurantId?: string): Promise<Dish[]> {
        const restaurant = await this.restaurantModel.findById(restaurantId).populate('dishesIds')
        return restaurant?.dishesIds || []
    }

    async getSuggestions(searchStr: string): Promise<Restaurant[]> {
        if (!searchStr) return []
        return await this.restaurantModel.find({ name: { $regex: searchStr, $options: 'i' } })
    }

    private buildPipeline(query: FilterBy, page?: number, limit: number = 6): { pipeline: PipelineStage[], countPipeline: PipelineStage[] } {
        const pipeline: PipelineStage[] = []
        const isOpenNowPage = query.isOpenNowPage === 'true'
        const now = new Date()
        const currDay = now.getDay()
        const currTime = now.getHours() * 60 + now.getMinutes()
        const prevDay = (currDay - 1 + 7) % 7

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
        if (query.sortBy) {
            const sortAndLimitStages = (sortBy: string) => [
                { $sort: { [sortBy]: -1 as const } },
                { $limit: 3 }
            ]

            pipeline.push(...sortAndLimitStages(query.sortBy))
        }
        if (isOpenNowPage) {
            pipeline.push(
                {
                    $addFields: {
                        todayHours: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$openingHours",
                                        as: "hours",
                                        cond: { $eq: ["$$hours.day", currDay] }
                                    }
                                },
                                0
                            ]
                        },
                        prevDayHours: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$openingHours",
                                        as: "hours",
                                        cond: { $eq: ["$$hours.day", prevDay] }
                                    }
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$todayHours", null] },
                                { $ne: ["$prevDayHours", null] },
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { $lt: ["$todayHours.close", "$todayHours.open"] },
                                                {
                                                    $or: [
                                                        { $gte: [currTime, "$todayHours.open"] },
                                                        {
                                                            $and: [
                                                                { $lt: [currTime, "$todayHours.close"] },
                                                                { $gte: [currTime, "$prevDayHours.open"] }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $gte: [currTime, "$todayHours.open"] },
                                                { $lt: [currTime, "$todayHours.close"] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $lt: ["$prevDayHours.close", "$prevDayHours.open"] },
                                                { $lt: [currTime, "$prevDayHours.close"] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            )
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
                        localField: 'dishesIds',
                        foreignField: '_id',
                        as: 'dishesIds'
                    }
                },
                {
                    $match: {
                        dishesIds: {
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

        const countPipeline = [...pipeline, { $count: 'total' }]

        if (page) {
            const skip = (page - 1) * limit
            pipeline.push({ $skip: skip }, { $limit: limit })
        }

        return { pipeline, countPipeline }
    }
}