let newTransaction = {
    display: function(Transaction){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit(Transaction)};
    },

    submit: function(Transaction){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;
        
        if(date > new Date()){
            banner.createError("CANNOT HAVE A DATE IN THE FUTURE");
            return;
        }
        
        let newTransaction = {
            date: date,
            recipes: []
        };

        for(let i = 0; i < recipeDivs.children.length;  i++){
            let quantity = recipeDivs.children[i].children[1].value;
            if(quantity !== "" && quantity > 0){
                newTransaction.recipes.push({
                    recipe: recipeDivs.children[i].recipe.id,
                    quantity: quantity
                });
            }else if(quantity < 0){
                banner.createError("CANNOT HAVE NEGATIVE VALUES");
                return;
            }
        }

        if(newTransaction.recipes.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/transaction/create", {
                method: "post",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newTransaction)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        let transaction = new Transaction(
                            response._id,
                            response.date,
                            response.recipes,
                            merchant
                        );
                        merchant.editTransactions(transaction);
                        banner.createNotification("NEW TRANSACTION CREATED");
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
}

module.exports = newTransaction;