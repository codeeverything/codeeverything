<?php
	error_reporting(E_ALL);
	$name = $_POST['name'];
	
	
	
	if(file_exists('../development/'.$name.'.js')) {
		print_r($_POST);
		echo $name;
	}
?>