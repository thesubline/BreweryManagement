const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Transaction = require("./Transaction.js");

class Merchant{
    constructor(oldMerchant, transactions){
        this.name = oldMerchant.name;
        this.pos = oldMerchant.pos;
        this.ingredients = [];
        this.recipes = [];
        this.transactions = [];
        this.orders = [];
        this.units = {
            mass: ["g", "kg", "oz", "lb"],
            volume: ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"],
            length: ["mm", "cm", "m", "in", "foot"],
            other: ["each"]
        }
        
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            this.ingredients.push({
                ingredient: new Ingredient(
                    oldMerchant.inventory[i].ingredient._id,
                    oldMerchant.inventory[i].ingredient.name,
                    oldMerchant.inventory[i].ingredient.category,
                    oldMerchant.inventory[i].ingredient.unitType,
                    oldMerchant.inventory[i].defaultUnit,
                    this
                ),
                quantity: oldMerchant.inventory[i].quantity
            });
        }

        for(let i = 0; i < oldMerchant.recipes.length; i++){
            this.recipes.push(new Recipe(
                oldMerchant.recipes[i]._id,
                oldMerchant.recipes[i].name,
                oldMerchant.recipes[i].price,
                oldMerchant.recipes[i].ingredients,
                this
            ));
        }

        for(let i = 0; i < transactions.length; i++){
            this.transactions.push(new Transaction(
                transactions[i]._id,
                transactions[i].date,
                transactions[i].recipes,
                this
            ));
        }
    }

    /*
    Updates all specified item in the merchant's inventory and updates the page
    If ingredient doesn't exist, add it
    ingredients = {
        ingredient: Ingredient object,
        quantity: new quantity,
        defaultUnit: the default unit to be displayed
    }
    remove = set true if removing
    isOrder = set true if this is coming from an order
    */
    editIngredients(ingredients, remove = false, isOrder = false){
        for(let i = 0; i < ingredients.length; i++){
            let isNew = true;
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient === ingredients[i].ingredient){
                    if(remove){
                        merchant.ingredients.splice(j, 1);
                    }else if(!remove && isOrder){
                        merchant.ingredients[j].quantity += ingredients[i].quantity;
                    }else{
                        merchant.ingredients[j].quantity = ingredients[i].quantity;
                    }
    
                    isNew = false;
                    break;
                }
            }
    
            if(isNew){
                merchant.ingredients.push({
                    ingredient: ingredients[i].ingredient,
                    quantity: parseFloat(ingredients[i].quantity),
                    defaultUnit: ingredients[i].defaultUnit
                });
            }
        }
    
        controller.updateData("ingredient");
        controller.closeSidebar();
    }

    /*
    Updates a recipe in the merchants list of recipes
    Can create, edit or remove
    recipe = [Recipe object]
    remove = will remove recipe when true
    */
    editRecipes(recipes, remove = false){
        let isNew = true;

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < this.recipes.length; j++){
                if(recipes[i] === this.recipes[j]){
                    if(remove){
                        this.recipes.splice(j, 1);
                    }else{
                        this.recipes[j] = recipes[i];
                    }

                    isNew = false;
                    break;
                }
            }

            if(isNew){
                merchant.recipes.push(recipes[i]);
            }
        }

        controller.updateData("recipe");
        controller.closeSidebar();
    }

    /*
    Updates a list of orders in the merchants list of orders
    Create/edit/remove
    orders = [Order object]
    remove = will remove order when true
    */
    editOrders(orders, remove = false){
        for(let i = 0; i < orders.length; i++){
            let isNew = true;
            for(let j = 0; j < this.orders.length; j++){
                if(orders[i] === this.orders[j]){
                    if(remove){
                        this.orders.splice(j, 1);
                    }else{
                        this.orders[j] = orders[i];
                    }

                    isNew = false;
                    break;
                }
            }

            if(isNew){
                this.orders.push(orders[i]);
            }
        }

        controller.updateData("order");
        controller.closeSidebar();
    }

    editTransactions(transaction, remove = false){
        let isNew = true;
        for(let i = 0; i < this.transactions.length; i++){
            if(this.transactions[i] === transaction){
                if(remove){
                    this.transactions.splice(i, 1);
                }

                isNew = false;
                break;
            }
        }

        if(isNew){
            this.transactions.push(transaction);
            this.transactions.sort((a, b) => a.date > b.date ? 1 : -1);
        }

        controller.updateData("transaction");
        controller.closeSidebar();
    }

    /*
    Gets the indices of two dates from transactions
    Inputs
    from: starting date
    to: ending date (default to now)
    Output
    Array containing starting index and ending index
    Note: Will return false if it cannot find both necessary dates
    */
    transactionIndices(from, to = new Date()){
        let indices = [];

        for(let i = 0; i < this.transactions.length; i++){
            if(this.transactions[i].date > from){
                indices.push(i);
                break;
            }
        }

        for(let i = this.transactions.length - 1; i >=0; i--){
            if(this.transactions[i].date < to){
                indices.push(i);
                break;
            }
        }

        if(indices.length < 2){
            return false;
        }

        return indices;
    }

    revenue(indices){
        let total = 0;

        for(let i = indices[0]; i <= indices[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === this.recipes[k]){
                        total += this.transactions[i].recipes[j].quantity * this.recipes[k].price;
                    }
                }
            }
        }

        return total / 100;
    }

    /*
    Gets the quantity of each ingredient sold between two dates (dateRange)
    Inputs
    dateRange: list containing a start date and an end date
    Return:
        [{
            ingredient: Ingredient object,
            quantity: quantity of ingredient sold
        }]
    */
    ingredientsSold(dateRange){
        if(!dateRange){
            return false;
        }
        
        let recipes = this.recipesSold(dateRange);
        let ingredientList = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < recipes[i].recipe.ingredients.length; j++){
                let exists = false;

                for(let k = 0; k < ingredientList.length; k++){
                    if(ingredientList[k].ingredient === recipes[i].recipe.ingredients[j].ingredient){
                        exists = true;
                        ingredientList[k].quantity += recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    ingredientList.push({
                        ingredient: recipes[i].recipe.ingredients[j].ingredient,
                        quantity: recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity
                    });
                }
            }
        }
    
        return ingredientList;
    }

    singleIngredientSold(dateRange, ingredient){
        let total = 0;

        for(let i = dateRange[0]; i < dateRange[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.transactions[i].recipes[j].recipe.ingredients.length; k++){
                    if(this.transactions[i].recipes[j].recipe.ingredients[k].ingredient === ingredient.ingredient){
                        total += this.transactions[i].recipes[j].recipe.ingredients[k].quantity;
                        break;
                    }
                }
            }
        }

        return total;
    }

    /*
    Gets the number of recipes sold between two dates (dateRange)
    Inputs:
        dateRange: array containing a start date and an end date
    Return:
        [{
            recipe: a recipe object
            quantity: quantity of the recipe sold
        }]
    */
    recipesSold(dateRange){
        let recipeList = [];

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                let exists = false;
                for(let k = 0; k < recipeList.length; k++){
                    if(recipeList[k].recipe === this.transactions[i].recipes[j].recipe){
                        exists = true;
                        recipeList[k].quantity += this.transactions[i].recipes[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    recipeList.push({
                        recipe: this.transactions[i].recipes[j].recipe,
                        quantity: this.transactions[i].recipes[j].quantity
                    });
                }
            }
        }

        return recipeList;
    }

    /*
    Create revenue data for graphing
    Input:
        dateRange: [start index, end index] (this.transactionIndices)
    Return:
        [total revenue for each day]
    */
    graphDailyRevenue(dateRange){
        if(!dateRange){
            return false;
        }

        let dataList = new Array(30).fill(0);
        let currentDate = this.transactions[dateRange[0]].date;
        let arrayIndex = 0;

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            if(this.transactions[i].date.getDate() !== currentDate.getDate()){
                currentDate = this.transactions[i].date;
                arrayIndex++;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                dataList[arrayIndex] += (this.transactions[i].recipes[j].recipe.price / 100) * this.transactions[i].recipes[j].quantity;
            }
        }

        return dataList;
    }
    
    /*
    Groups all of the merchant's ingredients by their category
    Return: [{
        name: category name,
        ingredients: [Ingredient Object]
    }]
    */
    categorizeIngredients(){
        let ingredientsByCategory = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let categoryExists = false;
            for(let j = 0; j < ingredientsByCategory.length; j++){
                if(this.ingredients[i].ingredient.category === ingredientsByCategory[j].name){
                    ingredientsByCategory[j].ingredients.push(this.ingredients[i]);

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: this.ingredients[i].ingredient.category,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByCategory;
    }

    unitizeIngredients(){
        let ingredientsByUnit = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let unitExists = false;
            for(let j = 0; j < ingredientsByUnit.length; j++){
                if(this.ingredients[i].ingredient.unit === ingredientsByUnit[j].name){
                    ingredientsByUnit[j].ingredients.push(this.ingredients[i]);

                    unitExists = true;
                    break;
                }
            }

            if(!unitExists){
                ingredientsByUnit.push({
                    name: this.ingredients[i].ingredient.unit,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByUnit;
    }

    getRecipesForIngredient(ingredient){
        let recipes = [];

        for(let i = 0; i < this.recipes.length; i++){
            for(let j = 0; j < this.recipes[i].ingredients.length; j++){
                if(this.recipes[i].ingredients[j].ingredient === ingredient){
                    recipes.push(this.recipes[i]);
                }
            }
        }

        return recipes;
    }
}

module.exports = Merchant;