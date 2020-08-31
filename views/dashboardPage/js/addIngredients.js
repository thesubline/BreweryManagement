let addIngredients = {
    isPopulated: false,
    fakeMerchant: {},
    chosenIngredients: [],

    display: function(Merchant){
        if(!this.isPopulated){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/ingredients")
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < merchant.ingredients.length; i++){
                            for(let j = 0; j < response.length; j++){
                                if(merchant.ingredients[i].ingredient.id === response[j]._id){
                                    response.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        
                        for(let i = 0; i < response.length; i++){
                            response[i] = {ingredient: response[i]}
                        }
                        this.fakeMerchant = new Merchant({
                                name: "none",
                                inventory: response,
                                recipes: [],
                            },
                            []
                        );

                        this.populateAddIngredients(true);
                    }
                })
                .catch((err)=>{
                    banner.createError("UNABLE TO RETRIEVE DATA");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });

            this.isPopulated = true;
        }
    },

    populateAddIngredients: function(newRequest = false){
        let addIngredientsDiv = document.getElementById("addIngredientList");
        let categoryTemplate = document.getElementById("addIngredientsCategory");
        let ingredientTemplate = document.getElementById("addIngredientsIngredient");

        let categories = this.fakeMerchant.categorizeIngredients();

        while(addIngredientsDiv.children.length > 0){
            addIngredientsDiv.removeChild(addIngredientsDiv.firstChild);
        }
        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.content.children[0].cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name;
            categoryDiv.children[0].children[1].onclick = ()=>{this.toggleAddIngredient(categoryDiv)};
            categoryDiv.children[1].style.display = "none";
            categoryDiv.children[0].children[1].children[1].style.display = "none";

            addIngredientsDiv.appendChild(categoryDiv);
            
            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredientDiv = ingredientTemplate.content.children[0].cloneNode(true);
                ingredientDiv.children[0].children[0].innerText = categories[i].ingredients[j].ingredient.name;
                ingredientDiv.children[0].children[1].onclick = ()=>{this.addOne(ingredientDiv)};
                ingredientDiv.ingredient = categories[i].ingredients[j].ingredient;

                categoryDiv.children[1].appendChild(ingredientDiv);
            }
        }

        if(newRequest){
            let myIngredients = document.getElementById("myIngredients");
            while(myIngredients.children.length > 0){
                myIngredients.removeChild(myIngredients.firstChild);
            }
        }

        document.getElementById("addIngredientsBtn").onclick = ()=>{this.submit()};
        document.getElementById("openNewIngredient").onclick = ()=>{controller.openSidebar("newIngredient")};
    },

    toggleAddIngredient: function(categoryElement){
        let button = categoryElement.children[0].children[1];
        let ingredientDisplay = categoryElement.children[1];

        if(ingredientDisplay.style.display === "none"){
            ingredientDisplay.style.display = "flex";

            button.children[0].style.display = "none";
            button.children[1].style.display = "block";
        }else{
            ingredientDisplay.style.display = "none";

            button.children[0].style.display = "block";
            button.children[1].style.display = "none";
        }
    },

    addOne: function(element){
        element.parentElement.removeChild(element);
        document.getElementById("myIngredients").appendChild(element);
        document.getElementById("myIngredientsDiv").style.display = "flex";
        element.children[1].style.display = "flex";

        for(let i = 0; i < this.fakeMerchant.ingredients.length; i++){
            if(this.fakeMerchant.ingredients[i].ingredient === element.ingredient){
                this.fakeMerchant.ingredients.splice(i, 1);
                this.chosenIngredients.push(element.ingredient);
                break;
            }
        }

        let select = element.children[1].children[1];
        let units = merchant.units[element.ingredient.unitType];
        for(let i = 0; i < units.length; i++){
            let option = document.createElement("option");
            option.innerText = units[i].toUpperCase();
            option.type = element.ingredient.unitType;
            option.value = units[i];
            select.appendChild(option);
        }

        element.children[0].children[1].innerText = "-";
        element.children[0].children[1].onclick = ()=>{this.removeOne(element)};
    },

    removeOne: function(element){
        element.parentElement.removeChild(element);
        element.children[1].style.display = "none";

        let select = element.children[0].children[1];
        while(select.children.length > 0){
            select.removeChild(select.firstChild);
        }

        element.children[0].children[1].innerText = "+";
        element.children[0].children[1].onclick = ()=>{this.addOne(element)};

        if(document.getElementById("myIngredients").children.length === 0){
            document.getElementById("myIngredientsDiv").style.display = "none";
        }

        for(let i = 0; i < this.chosenIngredients.length; i++){
            if(this.chosenIngredients[i] === element.ingredient){
                this.chosenIngredients.splice(i, 1);
                this.fakeMerchant.ingredients.push({
                    ingredient: element.ingredient
                });
                break;
            }
        }
        
        this.populateAddIngredients();
    },

    submit: function(){
        let ingredients = document.getElementById("myIngredients").children;
        let newIngredients = [];
        let fetchable = [];

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].children[0].value;
            let unit = ingredients[i].children[1].children[1].value;

            if(quantity === ""){
                banner.createError("PLEASE ENTER A QUANTITY FOR EACH INGREDIENT YOU WANT TO ADD TO YOUR INVENTORY");
                return;
            }
            quantity = controller.convertToMain(unit, quantity);

            let newIngredient = {
                ingredient: ingredients[i].ingredient,
                quantity: quantity
            }
            newIngredient.ingredient.unit = unit;

            newIngredients.push(newIngredient);

            fetchable.push({
                id: ingredients[i].ingredient.id,
                quantity: quantity,
                defaultUnit: unit
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/ingredients/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(fetchable)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editIngredients(newIngredients);
                    this.isPopulated = false;
                    banner.createNotification("ALL INGREDIENTS ADDED");
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

module.exports = addIngredients;