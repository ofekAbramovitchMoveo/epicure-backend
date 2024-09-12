import { UserLocation } from "src/api/restaurant/restaurant.schema"

export type FilterBy = {
    path?: string
    ratings?: number[]
    priceRange?: [number, number]
    distance?: [number, number]
    userLocation?: string | UserLocation
}
