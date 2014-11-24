<?php
//header('Content-Type: text/html');
//flush();
session_start();
ini_set('output_buffering','off');  
ini_set('zlib.output_compression', 0);  
//if ($_SERVER['HTTP_ACCEPT'] === 'text/event-stream') {
    //send the Content-Type header
    header('Content-Type: text/event-stream');
    //its recommended to prevent caching of event data
    header('Cache-Control: no-cache');
    //send the first event stream immediately
    //echo "data: This is the first event\n\n";
    //flush the output
   //flush();

    $i = 10;
    //create a loop to output more event streams
//    while (--$i) {
    	if(count($_SESSION['testtype']) < 1) {
    		sleep(0.5);
    		die();
    	}
        //pause for 1 second
        sleep(0.25);
        //emit an event stream
        $out = $_SESSION['testtype'] ? $_SESSION['testtype']: array();
        $final = array_pop($_SESSION['testtype']);
        while($char = array_shift($_SESSION['testtype'])) {
	        //echo "data:{$char}\n\n";
	        echo $char;
	        flush();
        }
        
        //echo "data:$final\n\n";
        echo $final;
        //flush the output again
	flush();
//    }    
//}


?>