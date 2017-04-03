<?php
//DB initialization
$cwd = getcwd();
$DB  = "$cwd/../db/employees.db";
$sql = new SQLite3($DB);

$username = $_SERVER['PHP_AUTH_USER'];

if (isset($_GET['manager']) AND $_GET['manager']) {
    $result      = $sql->query("SELECT designation, name FROM emp WHERE username='$username'");
    $resultArray = $result->fetchArray();
    if ($resultArray[0] == 'manager') {
      $name     = $resultArray[1];
      $result   = $sql->query("SELECT name, address, salary FROM emp where manager='$name';");
      $response = [];
      while($row = $result->fetchArray()) {
          $response[] = [
            'name'    => $row['name'],
            'address' => $row['address'],
            'salary'  => $row['salary'],
          ];
      }
    } else {
      $response = ['error' => "$username is not a manager"];
    }
} else {
  $result   = $sql->query("SELECT name, address, salary FROM emp where username='$username';");
  $row      = $result->fetchArray();
  $response[] = [
    'name'    => $row['name'],
    'address' => $row['address'],
    'salary'  => $row['salary'],
  ];
}

header('Content-type: application/json');
echo json_encode($response);


$sql->close();
