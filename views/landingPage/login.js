let loginObj = {
    display: function(username){
        controller.clearScreen();
        controller.loginStrand.style.display = "flex";
    },

    cancel: function(){
        event.preventDefault();
        
        publicObj.display();
    },
}