const ObjectId = require("mongoose").Types.ObjectId;

const Merchant = require("../models/merchant.js");
const Transaction = require("../models/transaction.js");
const Activity = require("../models/activity.js");

const helper = require("./helper.js");

module.exports = {
    /*
    GET - Shows the public landing page
    Return = a single error message (only if there is an error)
    Renders landingPage
    */
    landingPage: function(req, res){
        new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: req.session.user,
            route: "landing",
            date: new Date()
        })
            .save()
            .catch(()=>{});

        let error = {};
        let isLoggedIn = req.session.isLoggedIn || false;
        if(req.session.error){
            error = req.session.error;
            req.session.error = undefined;
        }else{
            error = null;
        }

        return res.render("landingPage/landing", {error: error, isLoggedIn: isLoggedIn});
    },

    /*
    GET - Displays the main inventory page for merchants
    Returns = the logged in merchant and his/her data
    Renders inventoryPage
    */
    displayDashboard: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: req.session.user,
            route: "dashboard",
            date: new Date()
        })
            .save()
            .catch(()=>{});

        let merchant2 = {};
        Merchant.findOne(
            {_id: req.session.user},
            {
                name: 1,
                pos: 1,
                posId: 1,
                posAccessToken: 1,
                lastUpdatedTime: 1,
                inventory: 1,
                recipes: 1,
                squareLocation: 1
            }
        )
            .populate("inventory.ingredient")
            .populate("recipes")
            .then(async (merchant)=>{
                merchant2 = merchant;
                if(merchant.pos === "clover"){
                    await helper.getCloverData(merchant);
                }else if(merchant.pos === "square"){
                    await helper.getSquareData(merchant);
                }else{
                    return;
                }

                return merchant.save();
            })
            .then((merchant)=>{
                if(merchant){
                    merchant2 = merchant;
                }
                let date = new Date();
                let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

                return Transaction.aggregate([
                    {$match: {
                        merchant: new ObjectId(req.session.user),
                        date: {$gte: firstDay},
                    }},
                    {$sort: {date: -1}},
                    {$project: {
                        date: 1,
                        recipes: 1
                    }}
                ]);      
            })
            .then((transactions)=>{
                merchant2._id = undefined;
                merchant2.posAccessToken = undefined;
                merchant2.lastUpdatedTime = undefined;
                merchant2.accountStatus = undefined;

                return res.render("dashboardPage/dashboard", {merchant: merchant2, transactions: transactions});
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";
                return res.redirect("/");
            });
    },

    //GET - Renders the information page
    displayLegal: function(req, res){
        return res.render("informationPage/information");
    },

    //GET - Renders the page to reset your password
    displayPassReset: function(req, res){
        return res.render("passResetPage/passReset");
    }
}