const CommonData = require("../models/Common")
const ApiError = require("../exceptions");

const {DRIVER} = require("../constants/constant")

class CommonServices {
    async get_data(key) {
        return CommonData.findOne({key}).select("data")
    }

    async get_decline_cases(userType) {
        return CommonData.findOne({
            key:
                parseInt(userType) === DRIVER
                    ? "driver_delete_passenger_cases"
                    : "passenger_decline_ride_cases",
        }).select("data")
    }

    async change_data(key, data) {
        if (key === 'cars') {
            if (!/^\d+$/.test(data.min_car_year_requirement.toString()) || data.min_car_year_requirement.toString().length !== 4) {
                throw ApiError.UnprocessableEntity('Data is not valid', {min_car_year_requirement: "Minimum car's year is not valid"})
            }
            data.cars =data.cars.sort((a,b)=>a.brand>b.brand?1:-1)
        }
        return CommonData.findOneAndUpdate({key}, {data}, {upsert: true}).lean(true)
    }
}

module.exports = new CommonServices()
