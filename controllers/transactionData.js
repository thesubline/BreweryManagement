const Transaction = require("../models/transaction");
const Merchant = require("../models/merchant");

const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
    /*
    POST - retrieves a list of transactions based on the filter
    req.body = {
        startDate: starting date to filter on,
        endDate: ending date to filter on,
        recipes: list of recipes to filter on
    }
    NOTE: May be a good idea to search recipes with for looping rather than query
        Needs some testing and playing with if so
    */
    getTransactions: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let objectifiedRecipes = [];
        for(let i = 0; i < req.body.recipes.length; i++){
            objectifiedRecipes.push(new ObjectId(req.body.recipes[i]));
        }
        let startDate = new Date(req.body.startDate);
        let endDate = new Date(req.body.endDate);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
        Transaction.aggregate([
            {$match: {
                merchant: new ObjectId(req.session.user),
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                recipes: {
                    $elemMatch: {
                        recipe: {
                            $in: objectifiedRecipes
                        }
                    }
                }
            }},
            {$sort: {date: -1}}
        ])
            .then((transactions)=>{
                return res.json(transactions);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE YOUR TRANSACTIONS");
            });
    },

    /*
    POST - create a new transaction
    req.body = {
        date: date of the transaction,
        recipes: [{
            recipe: id of the recipe to add,
            quantity: quantity of the recipe sold
        }]
    }
    */
    createTransaction: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let newTransaction = new Transaction({
            merchant: req.session.user,
            date: new Date(req.body.date),
            device: "none",
            recipes: req.body.recipes
        });

        newTransaction.save()
            .then((response)=>{
                return res.json(response);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO CREATE NEW TRANSACTION");
            });
    },

    /*
    DELETE - Remove a transaction from the database
    */
    remove: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Transaction.deleteOne({_id: req.params.id})
            .then((response)=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO DELETE TRANSACTION");
            });
    },

    /*
    GET - Creates 5000 transactions for logged in merchant for testing
    */
    populate: function(req, res){
        if(!req.session.user){
            res.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        function randomDate() {
            let now = new Date();
            let start = new Date();
            start.setFullYear(now.getFullYear() - 1);
            return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()));
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                let newTransactions = [];

                for(let i = 0; i < 5000; i++){
                    let newTransaction = new Transaction({
                        merchant: merchant._id,
                        date: randomDate(),
                        recipes: []
                    });

                    let numberOfRecipes = Math.floor((Math.random() * 5) + 1);

                    for(let j = 0; j < numberOfRecipes; j++){
                        let recipeNumber = Math.floor(Math.random() * merchant.recipes.length);
                        let randQuantity = Math.floor((Math.random() * 3) + 1);

                        newTransaction.recipes.push({
                            recipe: merchant.recipes[recipeNumber],
                            quantity: randQuantity
                        });
                    }

                    newTransactions.push(newTransaction);
                }

                Transaction.create(newTransactions)
                    .then((transactions)=>{
                        return res.redirect("/dashboard");
                    })
                    .catch((err)=>{
                        return;
                    });
            })
            .catch((err)=>{
                return;
            });
    }
}