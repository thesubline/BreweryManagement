window.helpObj = {
    display: function(){
        document.getElementById("legalStrand").style.display = "none";
        document.getElementById("helpStrand").style.display = "flex";

        let button = document.getElementById("logInButton");
        button.innerText="LEGAL";
        button.onclick = ()=>{legalObj.display()};
    }
}