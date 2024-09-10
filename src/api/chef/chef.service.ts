import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Chef } from './chef.schema'

@Injectable()
export class ChefService {
    constructor(@InjectModel(Chef.name) private chefModel: Model<Chef>) { }

    async getChefs(): Promise<Chef[]> {
        return this.chefModel.find()
    }

    async getChefById(id: string): Promise<Chef> {
        return this.chefModel.findById(id)
    }
}
