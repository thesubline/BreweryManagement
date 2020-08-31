const axios = require("axios");

const Recipe = require("../models/recipe.js");
const Merchant = require("../models/merchant.js");
const RecipeChange = require("../models/recipeChange.js");
const Validator = require("./validator.js");
const merchant = require("../models/merchant.js");

module.exports = {
    /*
    POST - creates a single new recipe
    req.body = {
        name: name of recipe,
        price: price of the recipe,
        ingredients: [{
            id: id of ingredient,
            quantity: quantity of ingredient in recipe
        }]
    }
    Return = newly created recipe in same form as above, with _id
    */
    createRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = Validator.recipe(req.body);
        if(validation !== true){
            return res.json(validation);
        }

        let recipe = new Recipe({
            merchant: req.session.user,
            name: req.body.name,
            price: Math.round(req.body.price * 100),
            ingredients: req.body.ingredients
        });


        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.recipes.push(recipe);
                merchant.save()
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE RECIPE");
                    });
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });

        recipe.save()
            .then((newRecipe)=>{
                return res.json(newRecipe);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO SAVE INGREDIENT");
            });
    },

    /*
    PUT - Update a single recipe
    req.body = {
        id: id of recipe,
        name: name of recipe,
        price: price of recipe,
        ingredients: [{
            ingredient: id of ingredient,
            quantity: quantity of ingredient in recipe
        }]
    }
    */
    updateRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = Validator.recipe(req.body);
        if(validation !== true){
            return res.json(validation);
        }

        let changes = [];

        Recipe.findOne({_id: req.body.id})
            .then((recipe)=>{
                for(let i = 0; i < req.body.ingredients.length; i++){
                    let isMatch = false;
                    for(let j = 0; j < recipe.ingredients.length; j++){
                        if(req.body.ingredients[i].ingredient === recipe.ingredients[j].ingredient.toString()){
                            let difference = parseFloat((req.body.ingredients[i].quantity - recipe.ingredients[j].quantity).toFixed(2));
                            if(difference !== 0){        
                                changes.push({
                                    ingredient: recipe.ingredients[j].ingredient,
                                    change: difference
                                });
                            }
                            isMatch = true;

                            break;
                        }
                    }

                    if(!isMatch){
                        changes.push({
                            ingredient: req.body.ingredients[i].ingredient,
                            change: req.body.ingredients[i].quantity
                        });
                    }
                }

                for(let i = 0; i < recipe.ingredients.length; i++){
                    let isMatch = false;
                    for(let j = 0; j < req.body.ingredients.length; j++){
                        if(recipe.ingredients[i].ingredient.toString() === req.body.ingredients[i].ingredient){
                            isMatch = true;
                        }
                    }

                    if(!isMatch){
                        changes.push({
                            ingredient: recipe.ingredients[i].ingredient,
                            change: -recipe.ingredients[i].quantity
                        });
                    }
                }

                recipe.name = req.body.name;
                recipe.price = req.body.price;
                recipe.ingredients = req.body.ingredients;

                return recipe.save()
            })
            .then((response)=>{
                res.json({});

                let recipeChange = new RecipeChange({
                    recipe: response._id,
                    date: new Date(),
                    changes: changes
                });

                return recipeChange.save()
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO UPDATE RECIPE");
            });
    },

    //GET - Checks clover for new or deleted recipes
    //Returns: 
    //  merchant: Full merchant (recipe ingredients populated)
    //  count: Number of new recipes
    updateRecipesClover: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((merchant)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/items?access_token=${merchant.posAccessToken}`)
                    .then((result)=>{
                        let deletedRecipes = merchant.recipes.slice();
                        for(let i = 0; i < result.data.elements.length; i++){
                            for(let j = 0; j < deletedRecipes.length; j++){
                                if(result.data.elements[i].id === deletedRecipes[j].posId){
                                    result.data.elements.splice(i, 1);
                                    deletedRecipes.splice(j, 1);
                                    i--;
                                    break;
                                }
                            }
                        }

                        for(let i = 0; i < deletedRecipes.length; i++){
                            for(let j = 0; j < merchant.recipes.length; j++){
                                if(deletedRecipes[i]._id === merchant.recipes[j]._id){
                                    merchant.recipes.splice(j, 1);
                                    break;
                                }
                            }
                        }

                        let newRecipes = []
                        for(let i = 0; i < result.data.elements.length; i++){
                            let newRecipe = new Recipe({
                                posId: result.data.elements[i].id,
                                merchant: merchant._id,
                                name: result.data.elements[i].name,
                                ingredients: [],
                                price: result.data.elements[i].price
                            });

                            merchant.recipes.push(newRecipe);
                            newRecipes.push(newRecipe);
                        }

                        Recipe.create(newRecipes)
                            .catch((err)=>{
                                return res.json("ERROR: UNABLE TO SAVE RECIPES");
                            });

                        merchant.save()
                            .then((newMerchant)=>{
                                newMerchant.populate("recipes.ingredients.ingredient").execPopulate()
                                    .then((newestMerchant)=>{
                                        merchant.password = undefined;
                                        return res.json({new: newRecipes, removed: deletedRecipes});
                                    })
                                    .catch((err)=>{
                                        return res.json("ERROR: UNABLE TO RETRIEVE DATA");
                                    });
                            })
                            .catch((err)=>{
                                return res.json("ERROR: UNABLE TO SAVE CHANGES FROM CLOVER");
                            });
                    })
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER");
                    });
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE MERCHANT DATA");
            });
    },

    updateRecipesSquare: function(req, res){
        
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let merchant = {};
        let merchantRecipes = [];
        let newRecipes = [];

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((fetchedMerchant)=>{
                merchant = fetchedMerchant;
                return axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${merchant.posAccessToken}`
                    }
                });
            })
            .then((response)=>{
                merchantRecipes = merchant.recipes.slice();

                
                for(let i = 0; i < response.data.objects.length; i++){
                    let itemData = response.data.objects[i].item_data;
                    for(let j = 0; j < itemData.variations.length; j++){
                        let isFound = false;

                        for(let k = 0; k < merchantRecipes.length; k++){
                            if(itemData.variations[j].id === merchantRecipes[k].posId){
                                merchantRecipes.splice(k, 1);
                                k--;
                                isFound = true;
                                break;
                            }
                        }

                        if(!isFound){
                            let newRecipe = new Recipe({
                                posId: itemData.variations[j].id,
                                merchant: merchant._id,
                                name: "",
                                price: itemData.variations[j].item_variation_data.price_money.amount,
                                ingredients: []
                            });

                            if(itemData.variations.length > 1){
                                newRecipe.name = `${itemData.name} '${itemData.variations[j].item_variation_data.name}'`;
                            }else{
                                newRecipe.name = itemData.name;
                            }

                            newRecipes.push(newRecipe);
                            merchant.recipes.push(newRecipe);
                        }
                    }
                }

                let ids = [];
                for(let i = 0; i < merchantRecipes.length; i++){
                    ids.push(merchantRecipes[i]._id);
                    for(let j = 0; j < merchant.recipes.length; j++){
                        if(merchantRecipes[i]._id.toString() === merchant.recipes[j]._id.toString()){
                            merchant.recipes.splice(j, 1);
                            j--;
                            break;
                        }
                    }
                }

                if(newRecipes.length > 0){
                    Recipe.create(newRecipes);
                }

                if(merchantRecipes.length > 0){
                    Recipe.deleteMany({_id: {$in: ids}});
                }

                return merchant.save();
            })
            .then((merchant)=>{
                return res.json({new: newRecipes, removed: merchantRecipes});
            })
            .catch((err)=>{
                return "ERROR: UNABLE TO RETRIEVE RECIPE DATA FROM SQUARE";
            });
    }
}