const Merchant = require("../models/merchant.js");

module.exports = {
    merchant: async function(merchant){
        if(!this.isSanitary([merchant.name])){
            return "Name contains illegal characters";
        }

        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(merchant.email)){
            return "Invalid email address";
        }

        let checkMerchant = await Merchant.findOne({email: merchant.email});

        if(checkMerchant){
            return "An account with that email address already exists";
        }

        let checkPassword = this.password(merchant.password, merchant.confirmPassword);
        if(this.password(checkPassword !== true)){
            return checkPassword;
        }

        return true;
    },

    password: function(password, confirmPassword){
        if(password.length < 10){
            return "Password must contain at least 10 characters";
        }

        if(password !== confirmPassword){
            return "Passwords do not match";
        }

        return true;
    },

    quantity: function(num){
        if(isNaN(num) || num === ""){
            return "Quantity must be a number";
        }

        if(num < 0){
            return "Quantity cannot be a negative number";
        }

        return true;
    },

    price: function(price){
        if(price < 0){
            return "Price cannot be a negative number";
        }

        if(isNaN(price) || price === ""){
            return "Price must be a number";
        }

        return true;
    },

    ingredient: function(ingredient){
        if(!this.isSanitary([ingredient.name, ingredient.category])){
            return "Ingredient contains illegal characters";
        }

        return true;
    },

    recipe: function(recipe){
        if(!this.isSanitary([recipe.name])){
            return "Ingredient contains illegal characters";
        }

        let priceCheck = this.price(recipe.price);
        if(priceCheck !== true){
            return priceCheck;
        }

        for(let i = 0; i < recipe.ingredients.length; i++){
            let checkQuantity = this.quantity(recipe.ingredients[i].quantity);
            if(checkQuantity !== true){
                return checkQuantity;
            }
        }

        for(let i = 0; i < recipe.ingredients.length; i++){
            for(let j = i + 1; j < recipe.ingredients.length; j++){
                if(recipe.ingredients[i].ingredient === recipe.ingredients[j].ingredient){
                    return "Recipe cannot contain duplicate ingredients";
                }
            }
        }

        return true;
    },

    order: function(order){
        if(!this.isSanitary([order.name])){
            return "Order name contains illegal characters";
        }

        if(new Date(order.date) > new Date()){
            return "Date cannot be in the future";
        }

        for(let i = 0; i < order.ingredients; i++){
            let quantityCheck = this.quantity(order.ingredients[i].quantity);
            if(quantityCheck !== true){
                return quantityCheck;
            }

            let priceCheck = this.price(order.ingredients[i].price);
            if(priceCheck !== true){
                return priceCheck;
            }
        }

        return true;
    },

    isSanitary: function(strings){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < strings.length; i++){
            for(let j = 0; j < disallowed.length; j++){
                if(strings[i].includes(disallowed[j])){
                    return false;
                }
            }
        }

        return true;
    }
}