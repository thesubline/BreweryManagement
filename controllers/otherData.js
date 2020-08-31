const bcrypt = require("bcryptjs");
const axios = require("axios");

const Merchant = require("../models/merchant");

module.exports = {
    /*
    POST - logs the user in
    req.body = {
        email: email of the user,
        password: password of the user
    }
    Redirects to /dashboard
    */
    login: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant){
                    bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                        if(result){
                            req.session.user = merchant._id;
                            return res.redirect("/dashboard");
                        }else{
                            req.session.error = "INVALID EMAIL OR PASSWORD";
                            return res.redirect("/");
                        }
                    });
                }else{
                    req.session.error = "INVALID EMAIL OR PASSWORD";
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";

                return res.redirect("/");
            });
    },

    /*
    GET - logs the user out
    Redirects to /
    */
    logout: function(req, res){
        req.session.user = undefined;

        return res.redirect("/");
    },

    //GET - Redirects user to Clover OAuth page
    cloverRedirect: function(req, res){
        return res.redirect(`${process.env.CLOVER_ADDRESS}/oauth/authorize?client_id=${process.env.SUBLINE_CLOVER_APPID}&redirect_uri=${process.env.SUBLINE_CLOVER_URI}`);
    },

    //GET - Redirects user to Square OAuth page
    squareRedirect: function(req, res){
        return res.redirect(`https://connect.squareupsandbox.com/oauth2/authorize?client_id=${process.env.SUBLINE_SQUARE_APPID}&scope=INVENTORY_READ+ITEMS_READ+MERCHANT_PROFILE_READ+ORDERS_READ+PAYMENTS_READ`);
    },

    //GET - Get access token from clover and  redirect to merchant creation
    cloverAuth: function(req, res){
        let dataArr = req.url.slice(req.url.indexOf("?") + 1).split("&");
        let authorizationCode = "";
        let merchantId = "";

        for(let i = 0; i < dataArr.length; i++){
            if(dataArr[i].slice(0, dataArr[i].indexOf("=")) === "merchant_id"){
                merchantId = dataArr[i].slice(dataArr[i].indexOf("=") + 1);
            }else if(dataArr[i].slice(0, dataArr[i].indexOf("=")) === "code"){
                authorizationCode = dataArr[i].slice(dataArr[i].indexOf("=") + 1);
            }
        }

        axios.get(`${process.env.CLOVER_ADDRESS}/oauth/token?client_id=${process.env.SUBLINE_CLOVER_APPID}&client_secret=${process.env.SUBLINE_CLOVER_APPSECRET}&code=${authorizationCode}`)
            .then((response)=>{
                Merchant.findOne({posId: merchantId})
                    .then((merchant)=>{
                        if(merchant){
                            merchant.posAccessToken = response.data.access_token;

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    req.session.user = updatedMerchant._id;
                                    return res.redirect("/dashboard");
                                })
                                .catch((err)=>{
                                    req.session.error("Error: unable to save critical data.  Try again.");
                                    return res.redirect("/")
                                });
                        }else{
                            req.session.merchantId = merchantId;
                            req.session.accessToken = response.data.access_token;
                            return res.redirect("/merchant/create/clover");
                        }
                    })
                    .catch((err)=>{
                        req.session.error = "ERROR: WE MADE AN OOPSIES";
                    });
                
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER";
                return res.redirect("/");
            });
    },

    squareAuth: function(req, res){
        const code = req.url.slice(req.url.indexOf("code=") + 5, req.url.indexOf("&"));
        const url = `${process.env.SQUARE_ADDRESS}/oauth2/token?`;
        let data = {
            client_id: process.env.SUBLINE_SQUARE_APPID,
            client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
            grant_type: "authorization_code",
            code: code
        };

        axios.post(url, data)
            .then((response)=>{
                data = response.data;
                return Merchant.findOne({posId: data.merchant_id});
            })
            .then((merchant)=>{
                if(merchant){
                    merchant.posAccessToken = data.access_token;

                    return merchant.save()
                        .then((merchant)=>{
                            req.session.user = merchant._id;
                            return res.redirect("/dashboard");
                        })
                        .catch((err)=>{
                            req.session.error = "ERROR: UNABLE TO CREATE NEW USER";
                            return res.redirect("/");
                        })
                }else{
                    req.session.merchantId = data.merchant_id;
                    req.session.accessToken = data.access_token;

                    return res.redirect("/merchant/create/square");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM SQUARE";
                return res.redirect("/");
            });
    }
}