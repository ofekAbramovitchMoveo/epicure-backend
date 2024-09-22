import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'

import { Chef } from './chef.schema'

@Injectable()
export class ChefService {
    constructor(@InjectModel(Chef.name) private chefModel: Model<Chef>) { }

    async getChefs(query: { path: string }): Promise<Chef[]> {
        const pipeline = this.buildPipeline(query)
        return await this.chefModel.aggregate(pipeline)
    }

    async getChefById(id: string): Promise<Chef> {
        return this.chefModel.findById(id)
    }

    async incrementChefView(chefId: string): Promise<Chef> {
        const chef = await this.chefModel.findById(chefId)
        if (!chef) throw new NotFoundException(`Chef with id ${chefId} not found`)
        const restaurantCount = chef.restaurantsIds.length
        const incrementBy = 1 / restaurantCount

        return this.chefModel.findByIdAndUpdate(
            chefId,
            { $inc: { views: incrementBy } },
            { new: true }
        )
    }

    private buildPipeline(query: { path: string }): PipelineStage[] {
        const pipeline = []
        const basePath = '/chefs/'

        if (query.path) {
            const sortAndLimitStages = (sortBy: string, limit: number) => [
                { $sort: { [sortBy]: -1 as const } },
                { $limit: limit }
            ]

            switch (query.path) {
                case `${basePath}new`:
                    pipeline.push(...sortAndLimitStages('createdAt', 6))
                    break
                case `${basePath}most-viewed`:
                    pipeline.push(...sortAndLimitStages('views', 3))
                    break
                default:
                    break
            }
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
