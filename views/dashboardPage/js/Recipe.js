class Recipe{
    constructor(id, name, price, ingredients, parent){
        this.id = id;
        this.name = name;
        this.price = price;
        this.parent = parent;
        this.ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < parent.ingredients.length; j++){
                if(ingredients[i].ingredient === parent.ingredients[j].ingredient.id){
                    this.ingredients.push({
                        ingredient: parent.ingredients[j].ingredient,
                        quantity: ingredients[i].quantity
                    });
                    break;
                }
            }
        }
    }
}

module.exports = Recipe;