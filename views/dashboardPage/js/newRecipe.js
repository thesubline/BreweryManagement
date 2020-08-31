let newRecipe = {
    display: function(Recipe){
        let ingredientsSelect = document.querySelector("#recipeInputIngredients select");
        let categories = merchant.categorizeIngredients();

        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let optgroup = document.createElement("optgroup");
            optgroup.label = categories[i].name;
            ingredientsSelect.appendChild(optgroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.value = categories[i].ingredients[j].ingredient.id;
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                optgroup.appendChild(option);
            }
        }

        document.getElementById("ingredientCount").onclick = ()=>{this.changeRecipeCount()};
        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit(Recipe)};
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeRecipeCount: function(){
        let newCount = document.getElementById("ingredientCount").value;
        let ingredientsDiv = document.getElementById("recipeInputIngredients");
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = ingredientsDiv.children[0].cloneNode(true);
                newNode.children[2].children[0].value = "";

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `INGREDIENT ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submit: function(Recipe){
        let newRecipe = {
            name: document.getElementById("newRecipeName").value,
            price: document.getElementById("newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.querySelectorAll("#recipeInputIngredients > div");
        for(let i = 0; i < inputs.length; i++){
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient.id === inputs[i].children[1].children[0].value){
                    newRecipe.ingredients.push({
                        ingredient: inputs[i].children[1].children[0].value,
                        quantity: controller.convertToMain(merchant.ingredients[j].ingredient.unit, inputs[i].children[2].children[0].value)
                    });

                    break;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newRecipe)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let recipe = new Recipe(
                        response._id,
                        response.name,
                        response.price,
                        response.ingredients,
                        merchant,
                    );
                    
                    merchant.editRecipes([recipe]);
                    banner.createNotification("RECIPE CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = newRecipe;