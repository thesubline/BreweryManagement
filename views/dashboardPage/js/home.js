let home = {
    isPopulated: false,
    graph: {},

    display: function(){
        if(!this.isPopulated){
            this.drawRevenueCard();
            this.drawRevenueGraph();
            this.drawInventoryCheckCard();
            this.drawPopularCard();

            this.isPopulated = true;
        }
    },

    drawRevenueCard: function(){
        let today = new Date();
        let firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        let lastMonthtoDay = new Date(new Date().setMonth(today.getMonth() - 1));

        let revenueThisMonth = merchant.revenue(merchant.transactionIndices(firstOfMonth));
        let revenueLastmonthToDay = merchant.revenue(merchant.transactionIndices(firstOfLastMonth, lastMonthtoDay));

        document.getElementById("revenue").innerText = `$${revenueThisMonth.toLocaleString("en")}`;

        let revenueChange = ((revenueThisMonth - revenueLastmonthToDay) / revenueLastmonthToDay) * 100;
        
        let img = "";
        if(revenueChange >= 0){
            img = "/shared/images/upArrow.png";
        }else{
            img = "/shared/images/downArrow.png";
        }
        document.querySelector("#revenueChange p").innerText = `${Math.abs(revenueChange).toFixed(2)}% vs last month`;
        document.querySelector("#revenueChange img").src = img;
    },

    drawRevenueGraph: function(){
        let graphCanvas = document.getElementById("graphCanvas");
        let today = new Date();

        graphCanvas.height = graphCanvas.parentElement.clientHeight;
        graphCanvas.width = graphCanvas.parentElement.clientWidth;

        let LineGraph = require("../../shared/graphs.js").LineGraph;
        this.graph = new LineGraph(graphCanvas);
        this.graph.addTitle("Revenue");

        let thirtyAgo = new Date(today);
        thirtyAgo.setDate(today.getDate() - 29);

        let data = merchant.graphDailyRevenue(merchant.transactionIndices(thirtyAgo));
        if(data){
            this.graph.addData(
                data,
                [thirtyAgo, new Date()],
                "Revenue"
            );
        }else{
            document.getElementById("graphCanvas").style.display = "none";
            
            let notice = document.createElement("h1");
            notice.innerText = "NO DATA YET";
            notice.classList = "notice";
            document.getElementById("graphCard").appendChild(notice);
        }
    },

    drawInventoryCheckCard: function(){
        let num;
        if(merchant.ingredients.length < 5){
            num = merchant.ingredients.length;
        }else{
            num = 5;
        }
        let rands = [];
        for(let i = 0; i < num; i++){
            let rand = Math.floor(Math.random() * merchant.ingredients.length);

            if(rands.includes(rand)){
                i--;
            }else{
                rands[i] = rand;
            }
        }

        let ul = document.querySelector("#inventoryCheckCard ul");
        let template = document.getElementById("ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];

            ingredientCheck.ingredient = merchant.ingredients[rands[i]];
            ingredientCheck.children[0].innerText = merchant.ingredients[rands[i]].ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{input.value--};
            input.value = merchant.ingredients[rands[i]].quantity.toFixed(2);
            ingredientCheck.children[1].children[2].onclick = ()=>{input.value++}
            ingredientCheck.children[2].innerText = merchant.ingredients[rands[i]].ingredient.unit.toUpperCase();

            ul.appendChild(ingredientCheck);
        }

        document.getElementById("inventoryCheck").onclick = ()=>{this.submitInventoryCheck()};
    },

    drawPopularCard: function(){
        let dataArray = [];
        let now = new Date();
        let thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let ingredientList = merchant.ingredientsSold(merchant.transactionIndices(thisMonth));
        if(ingredientList !== false){
            window.ingredientList = [...ingredientList];
            let iterations = (ingredientList.length < 5) ? ingredientList.length : 5;
            for(let i = 0; i < iterations; i++){
                try{
                    let max = ingredientList[0].quantity;
                    let index = 0;
                    for(let j = 0; j < ingredientList.length; j++){
                        if(ingredientList[j].quantity > max){
                            max = ingredientList[j].quantity;
                            index = j;
                        }
                    }

                    dataArray.push({
                        num: max,
                        label: ingredientList[index].ingredient.name + ": " +
                        ingredientList[index].ingredient.convert(ingredientList[index].quantity).toFixed(2) +
                        " " + ingredientList[index].ingredient.unit
                    });
                    ingredientList.splice(index, 1);
                }catch(err){
                    break;
                }
            }

            let thisCanvas = document.getElementById("popularCanvas");
            thisCanvas.width = thisCanvas.parentElement.offsetWidth * 0.8;
            thisCanvas.height = thisCanvas.parentElement.offsetHeight * 0.8;

            let HorizontalBarGraph = require("../../shared/graphs.js").HorizontalBarGraph;
            let popularGraph = new HorizontalBarGraph(thisCanvas);
            popularGraph.addData(dataArray);
        }else{
            document.getElementById("popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.getElementById("popularIngredientsCard").appendChild(notice);
        }
    },

    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];
        let fetchData = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                let merchIngredient = lis[i].ingredient;

                let value = parseFloat(lis[i].children[1].children[1].value);

                if(value !== merchIngredient.quantity){
                    changes.push({
                        id: merchIngredient.ingredient.id,
                        ingredient: merchIngredient.ingredient,
                        quantity: value
                    });

                    fetchData.push({
                        id: merchIngredient.ingredient.id,
                        quantity: value
                    });
                }
            }else{
                banner.createError("CANNOT HAVE NEGATIVE INGREDIENTS");
                return;
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        
        if(fetchData.length > 0){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(fetchData)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        

                        merchant.editIngredients(changes);
                        banner.createNotification("INGREDIENTS UPDATED");
                    }
                })
                .catch((err)=>{})
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = home;