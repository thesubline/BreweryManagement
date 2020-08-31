let validator = {
    /*
    ingredient = {
        ingredient: {
            name: name of ingredient,
            category: category of ingredient,
            unit: unit measure for ingredient
        },
        quantity: quantity of ingredient for current merchant
    }
    */
    ingredient: function(ingredient, createBanner = true){
        let errors = [];
        if(!this.isSanitary(ingredient.ingredient.name) ||
        !this.isSanitary(ingredient.ingredient.category) ||
        !this.isSanitary(ingredient.ingredient.unit)){
            errors.push("Contains illegal characters");
        }

        if(isNaN(ingredient.quantity) || ingredient.quantity === ""){
            errors.push("Must enter a valid number");
        }

        if(ingredient.quantity < 0){
            banner.createError("Quantity cannot be a negative number");
        }

        if(errors.length > 0){
            if(createBanner){
                for(let i = 0; i < errors.length; i++){
                    banner.createError(errors[i]);
                }
            }

            return false;
        }

        return true;
    },

    ingredientQuantity: function(quantity, createBanner = true){
        let errors = [];

        if(isNaN(quantity) || quantity === ""){
            errors.push("Must enter a valid number");
        }

        if(quantity < 0){
            banner.createError("Quantity cannot be a negative number");
        }

        if(errors.length > 0){
            if(createBanner){
                for(let i = 0; i < errors.length; i++){
                    banner.createError(errors[i]);
                }
            }

            return false;
        }

        return true;
    },

    merchant: {
        password: function(pass, confirmPass, createBanner = true){
            if(pass !== confirmPass){
                if(createBanner){
                    banner.createError("Your passwords do not match");
                }
                return false;
            }

            if(pass.length < 15){
                if(createBanner){
                    banner.createError("Your password must contain at least 15 characters");
                }
                return false;
            }

            return true;
        }
    },

    transaction: {
        date: function(from, to = new Date(), createBanner = true){
            let errors = [];
            let today = new Date();

            if(from > to){
                errors.push("Starting date must be before ending date");
            }

            if(from > today || to > today.setDate(today.getDate() + 1)){
                errors.push("Cannot choose a date in the future");
            }

            if(errors.length > 0){
                if(createBanner){
                    for(let i = 0; i < errors.length; i++){
                        banner.createError(errors[i]);
                    }

                    return false;
                }
            }

            return true;
        }
    },

    recipe: function(newRecipe, createBanner = true){
        let errors = [];

        if(!validator.isSanitary(newRecipe.name)){
            errors.push("Name contains invalid characters");
        }

        if(newRecipe.price < 0){
            errors.push("Price must contain a non-negative number");
        }

        if(newRecipe.ingredients.length === 0){
            errors.push("Must include at least one ingredient");
        }

        let checkSet = new Set();
        for(let i = 0; i < newRecipe.ingredients.length; i++){
            if(newRecipe.ingredients[i].quantity < 0){
                errors.push("Quantity must contain a non-negative number");
                break;
            }

            checkSet.add(newRecipe.ingredients[i].ingredient);
        }

        if(checkSet.size !== newRecipe.ingredients.length){
            errors.push("Recipe contains duplicate ingredients");
        }

        if(isNaN(newRecipe.price) || newRecipe.price === "" || newRecipe.price< 0){
            errors.push("Must enter a valid price");
        }

        if(errors.length > 0){
            if(createBanner){
                for(let i = 0; i < errors.length; i++){
                    banner.createError(errors[i]);
                }

                return false;
            }
        }

        return true;
    },

    order: function(order, createBanner = true){
        let errors = [];

        if(!validator.isSanitary(order.name, false)){
            errors.push("Your string contains illegal characters");
        }

        let now = new Date()
        if(order.date > now){
            errors.push("Cannot have a date/time in the future");
        }

        for(let i = 0; i < order.ingredients.length; i++){
            if(order.ingredients[i].quantity < 0){
                errors.push("Quantity cannot be negative");
                break;
            }

            if(order.ingredients[i].price < 0){
                errors.push("Price cannot be negative");
                break;
            }

            if(order.ingredients[i].price === "" || order.ingredients[i].quantity === ""){
                errors.push("Incomplete information");
            }
        }

        if(errors.length > 0){
            if(createBanner){
                for(let i = 0; i < errors.length; i++){
                    banner.createError(errors[i]);
                }
            }

            return false;
        }

        return true;
    },

    isSanitary: function(str, createBanner = true){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                if(createBanner){
                    banner.createError("Your string contains illegal characters");
                }
                return false;
            }
        }

        return true;
    }
}