<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<?php
error_reporting(E_ALL);
function startPage()
{
    print("<html>\n");
    print("<head>\n");
    print("<title>Salary Manager</title>\n");
    print("</head>\n");
    print("<body onload='getOwnSalaryDetails()'>\n");
    print("<div id='greeting'></div><br>\n");
}

function endPage()
{
    print("</body>\n");
    print("</html>\n");
}

$AUTH_ARRAY = ["manny" => "secret", "alice" => "secret", "trudy" => "secret"];

$username = "";
$password = "";

if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
    $username = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];
}

if(array_key_exists($username, $AUTH_ARRAY) AND $password == $AUTH_ARRAY[$username]) {
    startPage();
    print("<script type=\"text/javascript\" src=\"Trudy_ClientLib.js\"></script>");

    print("<h3 id='OwnSalary'></h3>\n");
    print("<script type=\"text/javascript\" src=\"SalaryManager_Client.js\"></script>");

    // Check if user is manager
    if ($username == "manny") {
        print("<button onclick='getSalaryDetailsOfEmployees()'>Get Employee Salaries</button><br>\n");
        print("<div id='salaryDetails'></div>");
    }
    endPage();
} else {
    //Send headers to cause a browser to request
    //username and password from user
    header("WWW-Authenticate: " .
        "Basic realm=\"EvilCorp\"");
    header("HTTP/1.0 401 Unauthorized");

    //Show failure text, which browsers usually
    //show only after several failed attempts
    print("This page is protected by HTTP " .
        "Authentication.<br>\nUse <b>morty</b> " .
        "for the username, and <b>secret</b> " .
        "for the password.<br>\n");
}
?>
