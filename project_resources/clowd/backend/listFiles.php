<?php
	
	
	error_reporting(E_ALL ^ E_NOTICE);
	
	$dir = $_GET['path'] ? $_GET['path']:"/wamp/www/clowd/development/";

	// Open a known directory, and proceed to read its contents
	if (is_dir($dir)) {
	    if ($dh = opendir($dir)) {
	        while (($file = readdir($dh)) !== false) {
	            if(filetype($dir . $file) == 'dir') {
		            echo '<span href="'.$dir . $file.'/" class="dir">'.$file.'</span><br/>';
		    } else {
		    	echo '<span href="'.$file.'" class="file">'.$file.'</span><br/>';
		    }
	        }
	        closedir($dh);
	
	    }
	}
?>