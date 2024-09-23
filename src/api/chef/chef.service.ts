import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'

import { Chef } from './chef.schema'

@Injectable()
export class ChefService {
    constructor(@InjectModel(Chef.name) private chefModel: Model<Chef>) { }

    async getChefs(query: { sortBy: string | null, limit: string | null }): Promise<Chef[]> {
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

    private buildPipeline(query: { sortBy: string | null, limit: string | null }): PipelineStage[] {
        const pipeline = []

        if (query.sortBy && query.limit) {
            const sortAndLimitStages = (sortBy: string, limit: number) => [
                { $sort: { [sortBy]: -1 as const } },
                { $limit: limit }
            ]

            pipeline.push(...sortAndLimitStages(query.sortBy, parseInt(query.limit)))
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
