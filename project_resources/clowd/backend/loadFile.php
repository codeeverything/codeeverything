<?php
	$name = $_GET['name'];
	
	//echo $name;
	echo file_get_contents('../'.$name);
?>