const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Validator = require("./validator.js");

module.exports = {
    //GET - gets a list of all database ingredients
    //Returns:
    //  ingredients: list containing all ingredients
    getIngredients: function(req, res){
        Ingredient.find()
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE INGREDIENTS");
            });
    },

    /*
    POST - create a single ingredient and then add to the merchant
    req.body = {
        ingredient: {
            name: name of ingredient,
            category: category of ingredient,
            unitType: category for the unit (mass, volume, length)
        },
        quantity: quantity of ingredient for current merchant,
        defaultUnit: default unit of measurement to display
    }
    Returns:
        Same as above, with the _id
    */
    createIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = Validator.ingredient(req.body.ingredient);
        if(validation !== true){
            return res.json(validation);
        }
        validation = Validator.quantity(req.body.quantity);
        if(validation !== true){
            return res.json(validation);
        }

        let ingredientPromise = Ingredient.create((req.body.ingredient));
        let merchantPromise = Merchant.findOne({_id: req.session.user});
        let newIngredient;

        Promise.all([ingredientPromise, merchantPromise])
            .then((response)=>{
                newIngredient = {
                    ingredient: response[0],
                    quantity: req.body.quantity,
                    defaultUnit: req.body.defaultUnit
                }

                response[1].inventory.push(newIngredient);

                return response[1].save();
            })
            .then((response)=>{
                return res.json(newIngredient);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO CREATE NEW INGREDIENT");
            });
    }
}