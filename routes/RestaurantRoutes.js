'use strict'
const RestaurantValidation = require('../controllers/validation/RestaurantValidation')
const RestaurantController = require('../controllers/RestaurantController')
const OrderController = require('../controllers/OrderController')
const ProductController = require('../controllers/ProductController')
const multer = require('multer')
const fs = require('fs')
const Restaurant = require('../models').Restaurant

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(process.env.RESTAURANTS_FOLDER, { recursive: true })
    cb(null, process.env.RESTAURANTS_FOLDER)
  },
  filename: function (req, file, cb) {
    cb(null, Math.random().toString(36).substring(7) + '-' + Date.now() + '.' + file.originalname.split('.').pop())
  }
})

const upload = multer({ storage }).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 }
])

module.exports = (options) => {
  const app = options.app
  const middlewares = options.middlewares

  app.route('/restaurants')
    .get(
      RestaurantController.index)
    .post(
      // TODO: Add needed middlewares
      RestaurantController.create)

  app.route('/restaurants/:restaurantId')
    .get(RestaurantController.show)
    .put(
      // TODO: Add needed middlewares
      RestaurantController.update)
    .delete(
      // TODO: Add needed middlewares
      RestaurantController.destroy)

  app.route('/restaurants/:restaurantId/orders')
    .get(
      // TODO: Add needed middlewares
      OrderController.indexRestaurant)

  app.route('/restaurants/:restaurantId/products')
    .get(
      // TODO: Add needed middlewares
      ProductController.indexRestaurant)

  app.route('/restaurants/:restaurantId/analytics')
    .get(
      // TODO: Add needed middlewares
      OrderController.analytics)
}
