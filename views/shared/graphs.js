//Creates a line graph within a canvas
//Will expand or shrink to the size of the canvas
//Inputs:
//  canvas = the canvas that you would like to draw on
//  yName = a string for the name of the Y axis
//  xName = a string for the name of the X axis
class LineGraph{
    constructor(canvas){
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.left = canvas.clientWidth - (canvas.clientWidth * 0.95);
        this.right = canvas.clientWidth * 1;
        this.top = canvas.clientHeight - (canvas.clientHeight * 1);
        this.bottom = canvas.clientHeight * 0.85;
        this.data = [];
        this.max = 0;
        this.xRange = [];
        this.colors = [];
        this.colorIndex = 0;

        for(let i = 0; i < 100; i++){
            let redRand = Math.floor(Math.random() * 200);
            let greenRand = Math.floor(Math.random() * 200);
            let blueRand = Math.floor(Math.random() * 200);

            this.colors.push(`rgb(${redRand}, ${greenRand}, ${blueRand})`);
        }
    }

    //Add a dataset to the graph to draw
    //Inputs:
    //  data = array containing list of numbers as the data points for the graph
    //      data[0] will be on the left.  data[data.length-1] will be on the right.
    //  xRange = array containing two elements, start and end for x axis data (currently only dates)
    //  name = string name for the line.  Used for display and finding lines.  Each must be unique
    addData(data, xRange, name){
        data = {
            set: data,
            colorIndex: this.colorIndex,
            name: name
        }
        this.colorIndex++;
        this.data.push(data);

        let isChange = false;
        for(let i = 0; i < data.set.length; i++){
            if(data.set[i] > this.max){
                this.max = data.set[i];
                this.verticalMultiplier = (this.bottom - this.top) / this.max;
                this.horizontalMultiplier = (this.right - this.left) / (data.set.length - 1);
                isChange = true;
            }
        }

        if(this.xRange.length === 0){
            this.xRange = xRange;
            isChange = true;
        }else{
            if(xRange[0] < this.xRange[0]){
                this.xRange[0] = xRange[0];
                isChange = true;
            }
            if(xRange[1] > this.xRange[1]){
                this.xRange[1] = xRange[1];
                isChange = true;
            }
        }

        if(isChange){
            this.drawGraph();
        }else{
            this.drawLine(data);
        }
    }

    //Removes a single data set from the graph and its line
    //Inputs:
    //  id = the unique identifier of the data set that was passed in with addData function
    removeData(name){
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].name === name){
                this.data.splice(i, 1);
                break;
            }
        }

        this.drawGraph();
    }

    //Completely clears all data
    //Does not delete the current graph displaying
    clearData(){
        this.max = 0;
        this.data = [];
        this.xRange = [];
    }

    addTitle(title){
        this.top = this.canvas.clientHeight - (this.canvas.clientHeight * 0.9);
        
        this.title = title;
    }

    /**********
    *********PRIVATE*********
    **********/
    drawGraph(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawYAxis();
        this.drawXAxis();

        for(let i = 0; i < this.data.length; i++){
            this.drawLine(this.data[i]);
        }

        if(this.title){
            this.context.font = "25px Saira";
            let xLocation = ((this.right - this.left) / 2) - (this.context.measureText(this.title).width / 2);
            this.context.fillText(this.title, xLocation, this.top - 10);
        }
    }

    drawLine(data){
        for(let i = 0; i < data.set.length - 1; i++){
            this.context.beginPath();
            this.context.moveTo(this.left + (this.horizontalMultiplier * i), this.bottom - (this.verticalMultiplier * data.set[i]));
            this.context.lineTo(this.left + (this.horizontalMultiplier * (i + 1)), this.bottom - (this.verticalMultiplier * data.set[i + 1]));
            this.context.strokeStyle = this.colors[data.colorIndex];
            this.context.lineWidth = 2;
            this.context.stroke();
        }

        this.context.strokeStyle = "black";

        if(this.data.length > 1){
            this.drawLegend(data.colorIndex, data.name);
        }
    }

    drawXAxis(){
        this.context.beginPath();
        this.context.moveTo(this.left, this.bottom);
        this.context.lineTo(this.right, this.bottom);
        this.context.lineWidth = 4;
        this.context.stroke();

        this.context.setLineDash([5, 10]);
        this.context.font = "10px Arial";
        this.context.lineWidth = 1;

        if(Object.prototype.toString.call(this.xRange[0]) === '[object Date]'){
            let diff = Math.abs(Math.floor((Date.UTC(this.xRange[0].getFullYear(), this.xRange[0].getMonth(), this.xRange[0].getDate()) - Date.UTC(this.xRange[1].getFullYear(), this.xRange[1].getMonth(), this.xRange[1].getDate())) / (1000 * 60 * 60 * 24))) + 1;
            let showDate = new Date(this.xRange[0]);
            
            for(let i = 0; i < diff; i += Math.floor(diff / 10)){
                this.context.fillText(showDate.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "2-digit"}), this.left + (this.horizontalMultiplier * i) - 20, this.bottom + 15);

                if(i !== 0){
                    this.context.beginPath()
                    this.context.moveTo(this.left + (this.horizontalMultiplier * i), this.bottom);
                    this.context.lineTo(this.left + (this.horizontalMultiplier * i), this.top);
                    this.context.strokeStyle = "#a5a5a5";
                    this.context.stroke();
                }

                showDate.setDate(showDate.getDate() + Math.abs(diff / 10));
            }
            
        }

        this.context.strokeStyle = "black";
        this.context.setLineDash([]);
    }

    drawYAxis(){
        this.context.beginPath();
        this.context.moveTo(this.left, this.top);
        this.context.lineTo(this.left, this.bottom);
        this.context.lineWidth = 2;
        this.context.stroke();

        this.context.setLineDash([5, 10]);
        this.context.font = "10px Arial";
        this.context.lineWidth = 1;

        let axisNum = 0;
        let verticalIncrement = (this.bottom - this.top) / 10;
        let verticalOffset = 0;
        do{
            this.context.fillText(Math.round(axisNum).toString(), this.left - 20, this.bottom - verticalOffset + 3);

            this.context.beginPath();
            this.context.moveTo(this.left, this.bottom - verticalOffset);
            this.context.lineTo(this.right, this.bottom - verticalOffset);
            this.context.strokeStyle = "#a5a5a5";
            this.context.stroke();

            verticalOffset += verticalIncrement;
            axisNum += this.max / 10;
        }while(verticalOffset <= (this.bottom - this.top));

        this.context.strokeStyle = "black";
        this.context.setLineDash([]);
    }

    drawLegend(colorIndex, name){
        let verticalOffset;
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].name === name){
                verticalOffset = i * 25;
                break;
            }
        }

        this.context.beginPath();
        this.context.fillStyle = this.colors[colorIndex];
        this.context.fillRect(this.right + 50, this.top + 50 + verticalOffset, 10, 10);
        this.context.stroke();

        this.context.font = "15px Arial";
        this.context.fillText(name, this.right + 65, this.top + 60 + verticalOffset);

        this.context.fillStyle = "black";
    }
}

class HorizontalBarGraph{
    constructor(canvas){
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.left = 0;
        this.right = canvas.clientWidth;
        this.top = canvas.clientHeight - (canvas.clientHeight * 0.99);
        this.bottom = canvas.clientHeight;
        this.data = [];
        this.max = 0;
    }

    //Adds an array of data points to the chart
    //All data is removed  and redrawn when called
    //Must pass in all data points
    //Inputs: 
    //  dataArray: array of objects
    //      num: number for the actual data
    //      label: text to display on bar
    addData(dataArray){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for(let i = 0; i < dataArray.length; i++){
            if(dataArray[i].num > this.max){
                this.max = dataArray[i].num;
            }

            this.data.push(dataArray[i]);
        }

        this.drawGraph();
    }

    drawGraph(){
        let barHeight = ((this.bottom - this.top) / this.data.length) - 2;

        for(let i = 0; i < this.data.length; i++){
            let topLocation = this.top + (i * barHeight) + 5;
            let width = (this.right - this.left) * (this.data[i].num / this.max);

            if(this.data[i].num >= this.max){
                this.context.fillStyle = "rgb(255, 99, 107)";
            }else{
                this.context.fillStyle = "rgb(179, 191, 209)";
            }

            this.context.beginPath();
            this.context.fillRect(this.left, topLocation, width, barHeight - 5);
            this.context.stroke();

            let textLocation  = 15;
            this.context.font = "12px Saira";
            this.context.fillStyle = "black";
            this.context.fillText(this.data[i].label, textLocation, (this.top) + (i * barHeight) + (barHeight / 1.5));
        }
    }
}

module.exports = {
    LineGraph: LineGraph,
    HorizontalBarGraph: HorizontalBarGraph
}