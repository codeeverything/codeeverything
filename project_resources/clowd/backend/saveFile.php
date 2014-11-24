<?php
	error_reporting(E_ALL);
	$file = $_POST['file'];
	$name = $_POST['name'];
	
	$fp = fopen($name, 'w');
	fwrite($fp, $file);
	fclose($fp);
	
	echo $name;
?>