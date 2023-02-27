# Introduction
We will learn how to define and implement the validation middleware and others on our backend Node.js Apps. Middlewares are intented to run some specific parts of our business logic such as:
* Validation of data from clients (the software that performs operations against the backend).
* Checking authorization.
* Checking permissions.
* Checking ownership of resources.

Secondly, we will learn how a Validation package will help us performing validation of data coming from clients.

## Prerequisites
* Keep in mind we are developing the backend software needed for DeliverUS project. Please, read project requirements found at: https://github.com/IISSI2-IS-2022-2023/DeliverUS-Backend/blob/main/README.md
* Software requirements for the developing environment con be found at Lab0 videos:
  * The template project includes EsLint configuration so it should auto-fix formatting problems as soon as a file is saved.
  * The template project also includes the complete model of the App, which was completed in the previous lab.


# Exercices

## 1. Accept GitHub Classroom assignment and clone
Accept the GitHub Classroom assignment to create your own repository based on this template (most likely you have already done it if you are reading these instructions). Afterwards, clone your own repository by opening VScode and clone the base lab repository by opening Command Palette (Ctrl+Shift+P or F1) and `Git clone` this repository, or using the terminal and running
```PowerShell
git clone <url>
```
Alternatively, you can use the *Source Control* button in the left-sided bar and click on *Clone Repository* button.

In case you are asked if you trust the author, please select yes.

It may be necessary to setup your git username by running the following commands on your terminal:
```PowerShell
git config --global user.name "FIRST_NAME LAST_NAME"
git config --global user.email "MY_NAME@example.com"
```

As in previous labs, it is needed to create a copy of the `.env.example` file, name it `.env` and include your environment variables.

Run `npm install` to download and install packages to the current project folder.

<!--Check and run mariaDB server.
* Macos:
```Powershell
mysql.server start
```
* Windows:
  * If installed as service run `services.msc` and start the mariadb service
  * If installed as binary, locate your mariaDB binary and start.
-->

## 2. Remember project structure

You will find the following elements (during this lab we will focus our attention on the `middlewares` and `controllers/validation` folders):

<!--* **`middlewares` folder: various checks needed such as authorization, permissions and ownership**
* **`controllers/validation` folder: validation of data included in client requests. One validation file for each entity**-->

* `package.json`: scripts for running the server and packages dependencies including express, sequelize and others. This file is usally created with `npm init`, but you can find it already in your cloned project.
    * In order to add more package dependencies you have to run `npm install packageName --save` or `npm install packageName --save-dev` for dependencies needed only for development environment (p. e. nodemon). To learn more about npm please refer to [its documentation](https://docs.npmjs.com/cli/v7/commands/npm).
* `package-lock.json`: install exactly the same dependencies in futures deployments. Notice that dependencies versions may change, so this file guarantees to download and deploy the exact same tree of dependencies.
* `backend.js`: run http server, setup connections to Mariadb and it will initialize various components
* `.env.example`: example environment variables.
* `models` folder: where models entities are defined
* `database` folder: where all the logic for creating and populating the database is located
    * `database/migrations` folder: where the database schema is defined
    * `database/seeders` folder: where database sample data is defined
* **`middlewares` folder: various checks needed such as authorization, permissions and ownership.**
* `controllers` folder: where business logic is implemented, including operations to the database
    * **`controllers/validation` folder: validation of data included in client requests. One validation file for each entity**
* `config` folder: where some global config files are stored (to run migrations and seeders from cli)
* `example_api_client` folder: will store test requests to our Rest API
* `.vscode` folder: VSCode config for this project


## 3. Middlewares and validation middleware.
You will find middlewares at `middlewares` folder. One for each entity, one for checking if a given id identifies a record of a given entity in the database, and another for authentication/authorization.

At `AuthMiddleware.js` file you will find two methods:
* `isLoggedIn` checks if the user is logged in (the request includes a valid bearer token).
*  `hasRole` receives an array of roles names and check if the logged-in user has the needed role.

At `EntityMiddleware.js` file you will find a method:
* `checkEntityExists` checks, for a given id and entity, if  there exists a record in the corresponding table in the database that matches such id.

At `ValidationHandlingMiddleware.js` file you will find a method:
* `handleValidation` checks the result from express-validator and if an error is found, returns 422 (Validation error) and stops the validation procedure.

Next, you will find a middleware file for each entity. Depending on the entity and the functional requirements we will need to check if the current logged-in user has enough privileges to accomplish the requested operation.

For instance, when a user sends a request for creating a new product we will need to check that:
* the user is logged in
* the user has the role owner (since customers cannot create products)
* the product belongs to a restaurant the he/she owns (data includes a restaurantId which belongs to the owner that makes the request)
* the product data include valid values for each property in order to be created according to our information requirements.

Moreover, if the data may include files, you will find an `upload` middleware that will handle this.

In order to check all these requirements, we have to include each middleware method in the corresponding route:
```Javascript
app.route('/products')
    .post(
      middlewares.isLoggedIn,
      middlewares.hasRole('owner'),
      upload,
      ProductValidation.create,
      middlewares.handleValidation,
      middlewares.checkProductRestaurantOwnership,
      ProductController.create
    )
```

### 3.1. Validation middlewares
Validation middlewares are intended to check if the data that comes in a request fulfills the information requirements. Most of this requirements are defined at the database level, and were including when creating the schema on the migration files. Some other requirements, are checked at the application layer. For instance, if you want to create a new restaurant, some images can be provided: logo image and hero image. These files should be image files and its size should be less than 10mbs. In order to check these other requirements we will use the `express-validator` package. **In our case, we will make a complete validation using `express-validator` regardless if such validation is partially included in the database or not.**

Notice that we will create a method for each endpoint that would require validation, usually a `create()` method for creating new data and a `update()` method for updating data.

More info about **using** middlewares can be found at Express documentation: https://expressjs.com/en/guide/using-middleware.html

More info about **writing** middlewares can be found at Express documentation: https://expressjs.com/en/guide/writing-middleware.html

### 3.2. Defining middlewares and validation middlewares for Restaurant routes
Open the file `routes/RestaurantRoutes.js`. You will find that routes are defined, but it is needed to define which middlewares will be called for each route. <!--Notice that the route `PUT restaurants/:restaurantId` has been completed as an example.-->

Include middlewares needed for Restaurant routes according to the requirements of Deliverus project. For each route you should determine if:
* is it needed that a user is logged in?
* is it needed that the user has a particular role?
* is it needed that the restaurant belongs to the logged-in user (restaurant data should include a userId which belongs to the owner of that restaurant)
* is it needed that the restaurant data include valid values for each property in order to be created according to our information requirements.

### 3.3. Implement validation middleware for Restaurant create()
Open the file `controllers/validation/RestaurantValidation.js`. You will find the methods for validating data when creating `create` and when updating `update`.
Restaurant properties are defined at database level. You can check the corresponding migration. Some validations are done at the app level, for instance we will include validations for check that email data is a valid email.

In order to add validations, follow this snippet:
```Javascript
create: [
    check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
    check('description').optional({ nullable: true, checkFalsy: true }).isString().trim(),
    check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
    check('postalCode').exists().isString().isLength({ min: 1, max: 255 }),
    check('url').optional({ nullable: true, checkFalsy: true }).isString().isURL().trim(),
    check('shippingCosts').exists().isFloat({ min: 0 }).toFloat(),
    check('email').optional({ nullable: true, checkFalsy: true }).isString().isEmail().trim(),
    check('phone').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1, max: 255 }).trim(),
    check('restaurantCategoryId').exists({ checkNull: true }).isInt({ min: 1 }).toInt(),
    check('userId').not().exists(),
    check('heroImage').custom((value, { req }) => {
      return checkFileIsImage(req, 'heroImage')
    }).withMessage('Please upload an image with format (jpeg, png).'),
    check('heroImage').custom((value, { req }) => {
      return checkFileMaxSize(req, 'heroImage', maxFileSize)
    }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
    check('logo').custom((value, { req }) => {
      return checkFileIsImage(req, 'logo')
    }).withMessage('Please upload an image with format (jpeg, png).'),
    check('logo').custom((value, { req }) => {
      return checkFileMaxSize(req, 'logo', maxFileSize)
    }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  ], update:[
    ...
  ]

```

For a comprehensive list of validations methods, see https://github.com/validatorjs/validator.js#validators


### 3.4. Check validation in controllers
When validation fails, it is passed to the following method in the middleware chain. In this case, the next method should be the validation handler method which will be always executed before the controller method.

Within the ''handleValidation'' method, we can check if any validation rule has been violated, and return the appropriate response. To this end, the ''handleValidation'' method includes the following:

```Javascript
const err = validationResult(req)
    if (err.errors.length > 0) {
      res.status(422).send(err)
    } else {
      next()
    }


```
<!-- 
Inspect `RestaurantController.js`, and see how validation is handled. -->




## 4. Test Restaurant routes, controllers and middlewares
Open ThunderClient extension ('https://www.thunderclient.io/'), and reload the collections if not already loaded by clicking on Collections → _**≡**_ menu→ reload. These collections are stored at `example_api_client/thunder-tests`.

Click on Collections folder and you will find a set of requests with tests for all endpoints. Run all the collection, you will find at the right side if a test is successful or not. Some requests perform more than one test.