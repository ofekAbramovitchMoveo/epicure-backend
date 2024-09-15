import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from './user.schema'

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async getUsers(): Promise<User[]> {
        let users = await this.userModel.find()
        users = users.map(user => {
            delete user.password
            return user
        })
        return users
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userModel.findById(id)
        delete user.password
        return user
    }

    async getUserByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email })
    }

    async add(user: User): Promise<User> {
        const userToAdd = {
            fullName: user.fullName,
            address: user.address,
            phone: user.phone,
            email: user.email,
            password: user.password
        }
        return await this.userModel.create(userToAdd)
    }
}
