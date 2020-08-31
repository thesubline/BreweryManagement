let controller = {
    publicStrand: document.getElementById("publicStrand"),
    loginStrand: document.getElementById("loginStrand"),
    registerStrand: document.getElementById("registerStrand"),

    onStart: function(){
        if(error){
            banner.createError(error);
        }

        publicObj.display();
    },

    clearScreen: function(){
        this.publicStrand.style.display = "none";
        this.loginStrand.style.display = "none";
        this.registerStrand.style.display = "none";
    }
}

controller.onStart();