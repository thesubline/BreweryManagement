window.legalObj = {
    display: function(){
        document.getElementById("legalStrand").style.display = "flex";
        document.getElementById("helpStrand").style.display = "none";

        document.getElementById("joinButton").style.display = "none";
        let button = document.getElementById("logInButton");
        button.innerText="HELP";
        button.onclick = ()=>{helpObj.display()};
    }
}

legalObj.display();