<?php
	
	
	error_reporting(E_ALL ^ E_NOTICE);

	//print_r($_GET);	
	$dir = $_GET['path'] ? $_GET['path']:"/wamp/www/clowd/development/";

	// Open a known directory, and proceed to read its contents
	if (is_dir($dir)) {
	    if ($dh = opendir($dir)) {
	        while (($file = readdir($dh)) !== false) {
	            if(filetype($dir . $file) == 'dir') {
		            echo '<a href="'.$dir . $file.'/" class="dir">'.$file.'</a><br/>';
		    } else {
		    	echo '<a href="'.$dir.$file.'" class="file">'.$file.'</a><br/>';
		    }
	        }
	        closedir($dh);
	
	    }
	}
?>