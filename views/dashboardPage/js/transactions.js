let transactions = {
    isPopulated: false,

    display: function(Transaction){
        if(!this.isPopulated){
            let transactionsList = document.getElementById("transactionsList");
            let dateDropdown = document.getElementById("dateDropdown");
            let recipeDropdown = document.getElementById("recipeDropDown");
            let template = document.getElementById("transaction").content.children[0];

            let now = new Date();
            let monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            document.getElementById("transFilDate1").valueAsDate = monthAgo;
            document.getElementById("transFilDate2").valueAsDate = now;

            dateDropdown.style.display = "none";
            recipeDropdown.style.display = "none";

            document.getElementById("dateFilterBtn").onclick = ()=>{this.toggleDropdown(dateDropdown)};
            document.getElementById("recipeFilterBtn").onclick = ()=>{this.toggleDropdown(recipeDropdown)};

            while(recipeDropdown.children.length > 0){
                recipeDropdown.removeChild(recipeDropdown.firstChild);
            }

            for(let i = 0; i < merchant.recipes.length; i++){
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.recipe = merchant.recipes[i];
                recipeDropdown.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = merchant.recipes[i].name;
                label.for = checkbox;
                recipeDropdown.appendChild(label);

                let brk = document.createElement("br");
                recipeDropdown.appendChild(brk);
            }

            while(transactionsList.children.length > 0){
                transactionsList.removeChild(transactionsList.firstChild);
            }

            let i = 0
            while(i < merchant.transactions.length && i < 100){
                let transactionDiv = template.cloneNode(true);
                let transaction = merchant.transactions[i];

                transactionDiv.onclick = ()=>{controller.openSidebar("transactionDetails", transaction)};
                transactionsList.appendChild(transactionDiv);

                let totalRecipes = 0;
                let totalPrice = 0;

                for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                    totalRecipes += merchant.transactions[i].recipes[j].quantity;
                    totalPrice += merchant.transactions[i].recipes[j].recipe.price * merchant.transactions[i].recipes[j].quantity;
                }

                transactionDiv.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
                transactionDiv.children[2].innerText = `$${(totalPrice / 100).toFixed(2)}`;

                i++;
            }

            document.getElementById("transFormSubmit").onsubmit = ()=>{this.submitFilter(Transaction)};

            this.isPopulated = true;
        }
    },

    submitFilter: function(Transaction){
        event.preventDefault();

        let data = {
            startDate: document.getElementById("transFilDate1").valueAsDate,
            endDate: document.getElementById("transFilDate2").valueAsDate,
            recipes: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let recipeChoices = document.getElementById("recipeDropDown");
        for(let i = 0; i < recipeChoices.children.length; i += 3){
            if(recipeChoices.children[i].checked){
                data.recipes.push(recipeChoices.children[i].recipe.id);
            }
        }

        if(data.recipes.length === 0){
            for(let i = 0; i < merchant.recipes.length; i++){
                data.recipes.push(merchant.recipes[i].id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "POST",
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
                    let transactionList = document.getElementById("transactionsList");
                    let template = document.getElementById("transaction").content.children[0];

                    while(transactionList.children.length > 0){
                        transactionList.removeChild(transactionList.firstChild);
                    }

                    for(let i = 0; i < response.length; i++){
                        let transactionDiv = template.cloneNode(true);
                        let recipeCount = 0;
                        let cost = 0;
                        let transaction = new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        );

                        for(let j = 0; j < transaction.recipes.length; j++){
                            recipeCount += transaction.recipes[j].quantity;
                            cost += transaction.recipes[j].quantity * transaction.recipes[j].recipe.price;
                        }

                        transactionDiv.children[0].innerText = `${transaction.date.toLocaleDateString()} ${transaction.date.toLocaleTimeString()}`;
                        transactionDiv.children[1].innerText = `${recipeCount} recipes sold`;
                        transactionDiv.children[2].innerText = `$${(cost / 100).toFixed(2)}`;
                        transactionDiv.onclick = ()=>{controller.openSidebar("transactionDetails", transaction)};
                        transactionList.appendChild(transactionDiv);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY THE TRANSACTIONS");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    toggleDropdown: function(dropdown){
        event.preventDefault();
        let polyline = dropdown.parentElement.children[0].children[1].children[0].children[0];

        if(dropdown.style.display === "none"){
            dropdown.style.display = "block";
            polyline.setAttribute("points", "18 15 12 9 6 15");
        }else{
            dropdown.style.display = "none";
            polyline.setAttribute("points", "6 9 12 15 18 9");
        }
    }
}

module.exports = transactions;