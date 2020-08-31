class Ingredient{
    constructor(id, name, category, unitType, unit, parent){
        this.id = id;
        this.name = name;
        this.category = category;
        this.unitType = unitType;
        this.unit = unit;
        this.parent = parent;
    }

    convert(quantity){
        if(this.unitType === "mass"){
            switch(this.unit){
                case "g": break;
                case "kg": quantity /= 1000; break;
                case "oz":  quantity /= 28.3495; break;
                case "lb":  quantity /= 453.5924; break;
            }
        }else if(this.unitType === "volume"){
            switch(this.unit){
                case "ml": quantity *= 1000; break;
                case "l": break;
                case "tsp": quantity *= 202.8842; break;
                case "tbsp": quantity *= 67.6278; break;
                case "ozfl": quantity *= 33.8141; break;
                case "cup": quantity *= 4.1667; break;
                case "pt": quantity *= 2.1134; break;
                case "qt": quantity *= 1.0567; break;
                case "gal": quantity /= 3.7854; break;
            }
        }else if(this.unitType === "length"){
            switch(this.unit){
                case "mm": quantity *= 1000; break;
                case "cm": quantity *= 100; break;
                case "m": break;
                case "in": quantity *= 39.3701; break;
                case "ft": quantity *= 3.2808; break;
            }
        }

        return quantity;
    }
}

module.exports = Ingredient;