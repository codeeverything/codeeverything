<?php
	error_reporting(E_ALL);
	$file = $_POST['sendstr'];

	$fp = fopen('edits.txt', 'a+');
	fwrite($fp, $file);
	fclose($fp);
	
	//echo $name;
?>