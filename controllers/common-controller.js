const commonService = require("../services/common-services")
const ApiError = require("../exceptions")
const { validationResult } = require("express-validator")

class CommonController {
	async contact_us(req, res, next) {
		try {
			const result = await commonService.get_data("contact_data")
			return res.json({ message: "Success", data: result.data })
		} catch (e) {
			next(e)
		}
	}

	async get_decline_cases(req, res, next) {
		try {
			const validation_result = await validationResult(req)
			let errors = {}
			if (!validation_result.isEmpty()) {
				validation_result.errors.map((error) => {
					errors[error.param] = error.msg
				})
				return next(ApiError.UnprocessableEntity("Data is not valid", errors))
			}
			const userType = req.params.type

			const results = await commonService.get_decline_cases(userType)

			return res.json({ message: "Success", data: results.data })
		} catch (e) {
			next(e)
		}
	}

	async get_cities(req, res, next) {
		try {
			const result = await commonService.get_data("cities")
			return res.json({ message: "Success", data: result.data })
		} catch (e) {
			next(e)
		}
	}

	async get_cars(req, res, next) {
		try {
			const result = await commonService.get_data("cars")

			const { cars, min_car_year_requirement } = result.data
			return res.json({ message: "Success", cars, min_car_year_requirement })
		} catch (e) {
			next(e)
		}
	}

	async get_features_of_ride(req, res, next) {
		try {
			const result = await commonService.get_data("features_of_ride")

			return res.json({ message: "Success", data: result.data })
		} catch (e) {
			next(e)
		}
	}

	async get_policy(req, res, next) {
		try {
			const result = await commonService.get_data("policy")
			return res.json({ message: "Success", data: result.data })
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new CommonController()
