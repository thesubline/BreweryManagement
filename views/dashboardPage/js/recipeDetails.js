let recipeDetails = {
    recipe: {},

    display: function(recipe){
        this.recipe = recipe;

        document.getElementById("recipeName").style.display = "block";
        document.getElementById("recipeNameIn").style.display = "none";
        document.querySelector("#recipeDetails h1").innerText = recipe.name;

        let ingredientList = document.getElementById("recipeIngredientList");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            ingredientDiv = template.cloneNode(true);

            ingredientDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `${recipe.ingredients[i].ingredient.convert(recipe.ingredients[i].quantity).toFixed(2)} ${recipe.ingredients[i].ingredient.unit}`;
            ingredientDiv.ingredient = recipe.ingredients[i].ingredient;
            ingredientDiv.name = recipe.ingredients[i].ingredient.name;

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("addRecIng").style.display = "none";

        let price = document.getElementById("recipePrice");
        price.children[1].style.display = "block";
        price.children[2].style.display = "none";
        price.children[1].innerText = `$${(recipe.price / 100).toFixed(2)}`;

        document.getElementById("recipeUpdate").style.display = "none";

        document.getElementById("editRecipeBtn").onclick = ()=>{this.edit()};
        if(merchant.pos === "none"){
            document.getElementById("removeRecipeBtn").onclick = ()=>{this.remove()};
        }
        document.getElementById("addRecIng").onclick = ()=>{this.displayAddIngredient()};
        document.getElementById("recipeUpdate").onclick = ()=>{this.update()};
    },

    edit: function(){
        let ingredientDivs = document.getElementById("recipeIngredientList");

        if(merchant.pos === "none"){
            let name = document.getElementById("recipeName");
            let nameIn = document.getElementById("recipeNameIn");
            name.style.display = "none";
            nameIn.style.display = "block";
            nameIn.value = this.recipe.name;

            let price = document.getElementById("recipePrice");
            price.children[1].style.display = "none";
            price.children[2].style.display = "block";
            price.children[2].value = parseFloat((this.recipe.price / 100).toFixed(2));
        }

        for(let i = 0; i < ingredientDivs.children.length; i++){
            let div = ingredientDivs.children[i];

            div.children[2].innerText = this.recipe.ingredients[i].ingredient.unit;
            div.children[1].style.display = "block";
            div.children[1].value = this.recipe.ingredients[i].ingredient.convert(this.recipe.ingredients[i].quantity).toFixed(2);
            div.children[3].style.display = "block";
            div.children[3].onclick = ()=>{div.parentElement.removeChild(div)};
        }

        document.getElementById("addRecIng").style.display = "flex";
        document.getElementById("recipeUpdate").style.display = "flex";
    },

    update: function(){
        this.recipe.name = document.getElementById("recipeNameIn").value || this.recipe.name;
        this.recipe.price = Math.round((document.getElementById("recipePrice").children[2].value * 100)) || this.recipe.price;
        this.recipe.ingredients = [];

        let divs = document.getElementById("recipeIngredientList").children;
        for(let i = 0; i < divs.length; i++){
            if(divs[i].name === "new"){
                let select = divs[i].children[0];
                this.recipe.ingredients.push({
                    ingredient: select.options[select.selectedIndex].ingredient,
                    quantity: controller.convertToMain(select.options[select.selectedIndex].ingredient.unit, divs[i].children[1].value)
                });
            }else{
                this.recipe.ingredients.push({
                    ingredient: divs[i].ingredient,
                    quantity: controller.convertToMain(divs[i].ingredient.unit, divs[i].children[1].value)
                });
            }
        }

        let data = {
            id: this.recipe.id,
            name: this.recipe.name,
            price: this.recipe.price,
            ingredients: []
        }

        for(let i = 0; i < this.recipe.ingredients.length; i++){
            data.ingredients.push({
                ingredient: this.recipe.ingredients[i].ingredient.id,
                quantity: this.recipe.ingredients[i].quantity
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    window.merchant.editRecipes([this.recipe]);
                    banner.createNotification("RECIPE UPDATE");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    remove: function(){
        fetch(`/merchant/recipes/remove/${this.recipe.id}`, {
            method: "DELETE"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editRecipes([this.recipe], true);
                    banner.createNotification("RECIPE REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            });
    },

    displayAddIngredient: function(){
        let template = document.getElementById("addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.getElementById("recipeIngredientList").appendChild(template);

        let categories = window.merchant.categorizeIngredients();

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                option.ingredient = categories[i].ingredients[j].ingredient;
                optGroup.appendChild(option);
            }
        }
    }
}

module.exports = recipeDetails;