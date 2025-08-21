let getELe = document.getElementById("my-div");

console.log(getELe);

let getELeByClass = document.createElement("div");
getELeByClass.className = "my-class";
let myTextNode = document.createTextNode("This is a text node");
getELeByClass.textContent = myTextNode.nodeValue;

console.log(getELeByClass);