const Order = require("../models/order.js");
const Merchant = require("../models/merchant.js");
const ObjectId = require("mongoose").Types.ObjectId;
const Validator = require("./validator.js");

module.exports = {
    /*
    GET - get the 25 most recent orders
    return = [
        _id: id of order,
        name: user created id for order,
        date: date order was created,
        ingredients: [{
            _id: unused id of this object,
            ingredient: id of the ingredient,
            price: price per unit of the ingredient,
            quantity: quantity of ingredient in this order
        }]
    ]
    */
    getOrders: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Order.aggregate([
            {$match: {merchant: ObjectId(req.session.user)}},
            {$sort: {date: -1}},
            {$limit: 25},
            {$project: {
                name: 1,
                date: 1,
                ingredients: 1
            }}
        ])
            .then((orders)=>{
                return res.json(orders);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE YOUR ORDERS");
            });
    },

    /*
    POST - retrieves a list of transactions based on the filter
    req.body = {
        startDate: starting date to filter on,
        endDate: ending date to filter on,
        ingredients: list of recipes.to filter on
    }
    */
    orderFilter: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let objectifiedIngredients = [];
        for(let i = 0; i < req.body.ingredients.length; i++){
            objectifiedIngredients.push(new ObjectId(req.body.ingredients[i]));
        }
        let startDate = new Date(req.body.startDate);
        let endDate = new Date(req.body.endDate);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
        Order.aggregate([
            {$match: {
                merchant: new ObjectId(req.session.user),
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                ingredients: {
                    $elemMatch: {
                        ingredient: {
                            $in: objectifiedIngredients
                        }
                    }
                }
            }},
            {$sort: {date: -1}}
        ])
            .then((orders)=>{
                return res.json(orders);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE YOUR TRANSACTIONS");
            });
    },

    /*
    POST - Creates a new order from the site
    req.body = {
        name: user created order id
        date: creation date
        ingredients: [{
            ingredient: id of the ingredient
            quantity: amount of the ingredient purchased
            price: price per unit for ingredient
        }]
    } 
    */ 
    createOrder: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = Validator.order(req.body);
        if(validation !== true){
            return res.json(validation);
        }

        let newOrder = new Order(req.body);
        newOrder.merchant = req.session.user;
        newOrder.save()
            .then((response)=>{
                res.json(response);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO SAVE ORDER");
            });

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let i = 0; i < req.body.ingredients.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(req.body.ingredients[i].ingredient === merchant.inventory[j].ingredient.toString()){
                            merchant.inventory[j].quantity += parseFloat(req.body.ingredients[i].quantity);
                        }
                    }
                }

                return merchant.save()
            })
            .then((merchant)=>{
                return;
            })
            .catch(()=>{});
    },

    /*
    DELETE - Remove an order from the database
    */
    removeOrder: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Order.deleteOne({_id: req.params.id})
            .then((response)=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO REMOVE ORDER");
            });
    }
}