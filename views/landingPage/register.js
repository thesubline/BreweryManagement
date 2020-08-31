let registerObj = {
    display: function(){
        controller.clearScreen();
        controller.registerStrand.style.display = "flex";

        document.getElementById("checkAgree").checked = false;
        document.getElementById("regButton").classList = "buttonDisabled";
    },

    agreement: function(){
        let checkbox = document.getElementById("checkAgree");
        let button = document.getElementById("regButton");

        if(checkbox.checked){
            button.classList = "button";
        }else{
            button.classList = "buttonDisabled";
        }
    },

    submit: function(){
        event.preventDefault();

        let form = document.querySelector("#registerStrand form");
        let checkbox = document.getElementById("checkAgree");

        if(!checkbox.checked){
            banner.createError("Please agree to the Privacy Policy and Terms and Conditions to continue");
            return;
        }

        let pass = document.getElementById("regPass").value;
        let confirmPass = document.getElementById("regConfirmPass").value;
        if(pass !== confirmPass){
            banner.createError("Your passwords do not match");
            return;
        }

        if(checkbox.checked){
            if(validator.isSanitary(document.getElementById("regName").value)){
                document.getElementById("loaderContainer").style.display = "flex";
                form.action = "merchant/create/none";
                form.method = "post";
                form.submit();
            }
        }else{
            banner.createError("Please agree to the Privacy Policy and Terms and Conditions to continue");
        }
    }
}