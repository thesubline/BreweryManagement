let newOrder = {
    isPopulated: false,
    unused: [],

    display: function(Order){
        if(!this.isPopulated){
            let categories = merchant.categorizeIngredients();
            let categoriesList = document.getElementById("newOrderCategories");
            let template = document.getElementById("addIngredientsCategory").content.children[0];
            let ingredientTemplate = document.getElementById("newOrderIngredient").content.children[0];
    
            for(let i = 0; i < categories.length; i++){
                let category = template.cloneNode(true);
    
                category.children[0].children[0].innerText = categories[i].name;
                category.children[0].children[1].onclick = ()=>{this.toggleAddIngredient(category)};
                category.children[0].children[1].children[1].style.display = "none";
                category.children[1].style.display = "none";
                
                categoriesList.appendChild(category);
    
                for(let j = 0; j < categories[i].ingredients.length; j++){
                    let ingredientDiv = ingredientTemplate.cloneNode(true);
    
                    ingredientDiv.children[0].children[0].innerText = categories[i].ingredients[j].ingredient.name;
                    ingredientDiv.children[0].children[1].onclick = ()=>{this.addOne(ingredientDiv, category.children[1])};
                    ingredientDiv.ingredient = categories[i].ingredients[j].ingredient;
    
                    this.unused.push(categories[i].ingredients[j]);
                    category.children[1].appendChild(ingredientDiv);
                }
            }

            document.getElementById("submitNewOrder").onclick = ()=>{this.submit(Order)};

            this.isPopulated = true;
        }
    },

    addOne: function(ingredientDiv, container){
        for(let i = 0; i < this.unused.length; i++){
            if(this.unused[i] === ingredientDiv){
                this.unused.splice(i, 1);
                break;
            }
        }

        ingredientDiv.children[0].children[1].innerText = "-";
        ingredientDiv.children[0].children[1].onclick = ()=>{this.removeOne(ingredientDiv, container)};
        ingredientDiv.children[1].style.display = "flex";

        container.removeChild(ingredientDiv);
        document.getElementById("newOrderAdded").appendChild(ingredientDiv);
    },

    removeOne: function(ingredientDiv, container){
        this.unused.push(ingredientDiv.ingredient);

        ingredientDiv.children[1].style.display = "none";
        ingredientDiv.children[0].children[1].innerText = "+";
        ingredientDiv.children[0].children[1].onclick = ()=>{this.addOne(ingredientDiv, container)};
        
        ingredientDiv.parentElement.removeChild(ingredientDiv);
        container.appendChild(ingredientDiv);
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

    submit: function(Order){
        let categoriesList = document.getElementById("newOrderAdded");
        let ingredients = [];

        for(let i = 0; i < categoriesList.children.length; i++){
            let quantity = categoriesList.children[i].children[1].children[0].value;
            let price = categoriesList.children[i].children[1].children[1].value;

            let fakeOrder = new Order(undefined, undefined, new Date(), [], undefined);
            if(quantity !== ""  && price !== ""){
                ingredients.push({
                    ingredient: categoriesList.children[i].ingredient.id,
                    quantity: controller.convertToMain(categoriesList.children[i].ingredient.unit, parseFloat(quantity)),
                    price: categoriesList.children[i].ingredient.convert(parseInt(price * 100))
                });
            }
        }

        let time = document.getElementById("orderTime").value;
        let date = document.getElementById("orderDate").value;
        let dateTime = "";
        if(time === "" && date === ""){
            dateTime = undefined;
        }else if(time === "" && date !== ""){
            dateTime = date;
        }else if(time !== "" && date === ""){
            banner.createError("PLEASE ADD A DATE IF YOU WISH TO HAVE A TIME");
        }else{
            dateTime = `${date}T${time}:00`
        }

        let data = {
            name: document.getElementById("orderName").value,
            date: dateTime,
            ingredients: ingredients
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        
        fetch("/order/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let order = new Order(
                       response._id,
                       response.name,
                       response.date,
                       response.ingredients,
                       merchant 
                    )

                    merchant.editOrders([order]);
                    merchant.editIngredients(order.ingredients, false, true);
                    banner.createNotification("ORDER CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOEMTHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = newOrder;