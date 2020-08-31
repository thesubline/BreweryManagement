let ingredientDetails = {
    ingredient: {},
    dailyUse: 0,

    display: function(ingredient){
        this.ingredient = ingredient;

        document.getElementById("editIngBtn").onclick = ()=>{this.edit()};
        document.getElementById("removeIngBtn").onclick = ()=>{this.remove(merchant)};

        document.querySelector("#ingredientDetails p").innerText = ingredient.ingredient.category;
        document.querySelector("#ingredientDetails h1").innerText = ingredient.ingredient.name;
        let ingredientStock = document.getElementById("ingredientStock");
        ingredientStock.innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
        ingredientStock.style.display = "block";
        let ingredientInput = document.getElementById("ingredientInput");
        ingredientInput.value = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);
        ingredientInput.style.display = "none";

        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);
            let indices = merchant.transactionIndices(startDay, endDay);

            if(indices === false){
                quantities.push(0);
            }else{
                quantities.push(merchant.singleIngredientSold(indices, ingredient));
            }
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        this.dailyUse = sum / quantities.length;

        document.getElementById("dailyUse").innerText = `${ingredient.ingredient.convert(this.dailyUse).toFixed(2)} ${ingredient.ingredient.unit}`;

        let ul = document.getElementById("ingredientRecipeList");
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < recipes.length; i++){
            let li = document.createElement("li");
            li.innerText = recipes[i].name;
            li.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            ul.appendChild(li);
        }

        let ingredientButtons = document.getElementById("ingredientButtons");
        let units = [];
        let unitLabel = document.getElementById("displayUnitLabel");
        let defaultButton = document.getElementById("defaultUnit");
        if(this.ingredient.ingredient.unitType !== "other"){
            units = merchant.units[this.ingredient.ingredient.unitType];
            unitLabel.style.display = "block";
            defaultButton.style.display = "block";
        }else{
            unitLabel.style.display = "none";
            defaultButton.style.display = "none";
        }
        
        while(ingredientButtons.children.length > 0){
            ingredientButtons.removeChild(ingredientButtons.firstChild);
        }
        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button, units[i])};
            ingredientButtons.appendChild(button);

            if(units[i] === this.ingredient.ingredient.unit){
                button.classList.add("unitActive");
            }
        }

        document.getElementById("defaultUnit").onclick = ()=>{this.changeUnitDefault()};
        document.getElementById("editSubmitButton").onclick = ()=>{this.editSubmit()};
    },

    remove: function(merchant){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(this.ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    banner.createError("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/merchant/ingredients/remove/${this.ingredient.ingredient.id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("INGREDIENT REMOVED");
                    merchant.editIngredients([this.ingredient], true);
                }
            })
            .catch((err)=>{})
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    edit: function(){
        document.getElementById("ingredientStock").style.display = "none";
        document.getElementById("ingredientInput").style.display = "block";
        document.getElementById("editSubmitButton").style.display = "block";
    },

    editSubmit: function(){
        this.ingredient.quantity = controller.convertToMain(
            this.ingredient.ingredient.unit,
            Number(document.getElementById("ingredientInput").value)
        );
        
        let data = [{
            id: this.ingredient.ingredient.id,
            quantity: controller.convertToMain(this.ingredient.ingredient.unit, this.ingredient.quantity)
        }];

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/ingredients/update", {
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
                    merchant.editIngredients([this.ingredient]);
                    banner.createNotification("INGREDIENT UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    changeUnit: function(newActive, unit){
        this.ingredient.ingredient.unit = unit;

        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            ingredientButtons[i].classList.remove("unitActive");
        }

        newActive.classList.add("unitActive");

        controller.updateData("unit");
        document.getElementById("ingredientStock").innerText = `${this.ingredient.ingredient.convert(this.ingredient.quantity).toFixed(2)} ${this.ingredient.ingredient.unit.toUpperCase()}`;
        document.getElementById("dailyUse").innerText = `${this.ingredient.ingredient.convert(this.dailyUse).toFixed(2)} ${this.ingredient.ingredient.unit}`;
    },

    changeUnitDefault: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        let id = this.ingredient.ingredient.id;
        let unit = this.ingredient.ingredient.unit;
        fetch(`/merchant/ingredients/update/${id}/${unit}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("INGREDIENT DEFAULT UNIT UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = ingredientDetails;