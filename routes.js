const renderer = require("./controllers/renderer");
const merchantData = require("./controllers/merchantData");
const ingredientData = require("./controllers/ingredientData");
const otherData = require("./controllers/otherData");
const transactionData = require("./controllers/transactionData");
const recipeData = require("./controllers/recipeData");
const orderData = require("./controllers/orderData.js");

module.exports = function(app){
    //Render page
    app.get("/", renderer.landingPage);
    app.get("/dashboard", renderer.displayDashboard);
    app.get("/information", renderer.displayLegal);
    app.get("/resetpassword/*", renderer.displayPassReset);

    //Merchant
    app.post("/merchant/create/none", merchantData.createMerchantNone);
    app.get("/merchant/create/clover", merchantData.createMerchantClover);
    app.get("/merchant/create/square", merchantData.createMerchantSquare);
    app.delete("/merchant/recipes/remove/:id", merchantData.removeRecipe);
    app.post("/merchant/ingredients/add", merchantData.addMerchantIngredient);
    app.delete("/merchant/ingredients/remove/:id", merchantData.removeMerchantIngredient);
    app.put("/merchant/ingredients/update/:id/:unit", merchantData.ingredientDefaultUnit);
    app.put("/merchant/ingredients/update", merchantData.updateMerchantIngredient);
    app.post("/merchant/password", merchantData.updatePassword);

    //Ingredients
    app.get("/ingredients", ingredientData.getIngredients);
    app.post("/ingredients/create", ingredientData.createIngredient);  //also adds to merchant

    //Recipes
    app.post("/recipe/create", recipeData.createRecipe);
    app.put("/recipe/update", recipeData.updateRecipe);
    app.get("/recipe/update/clover", recipeData.updateRecipesClover);
    app.get("/recipe/update/square", recipeData.updateRecipesSquare);

    //Orders
    app.get("/order", orderData.getOrders);
    app.post("/order", orderData.orderFilter);
    app.post("/order/create", orderData.createOrder);
    app.delete("/order/:id", orderData.removeOrder);

    //Transactions
    app.post("/transaction", transactionData.getTransactions);
    app.post("/transaction/create", transactionData.createTransaction);
    app.delete("/transaction/:id", transactionData.remove);
    app.get("/populatesometransactions", transactionData.populate);

    //Other
    app.post("/login", otherData.login);
    app.get("/logout", otherData.logout);
    app.get("/cloverlogin", otherData.cloverRedirect);
    app.get("/squarelogin", otherData.squareRedirect);
    app.get("/cloverauth*", otherData.cloverAuth);
    app.get("/squareauth", otherData.squareAuth);
}