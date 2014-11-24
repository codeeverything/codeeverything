//renderer
function Renderer() {
	
	this.drawCode = function(tokens, y, offset) {
	    	if(!canvas) {
			var canvas = document.getElementById("canvas");
			var context = canvas.getContext("2d");
			
			context.textBaseline = "top";
			context.font = "11pt monospace";
			context.clearRect(0,0,800,800);
	    	}
	    	
	    	//i'm not sure if this helps or not? maybe it clears down the memory being used by the canvas?
	    	//context.clearRect(0,0,800,800);
	        var style = '';
	        var prevStyle = 'boo';
	        var bitOfLine = '';
	        //y = y ? y:1;
	        var currentToken = '';
	        var currentTokenStr = '';
	        var tlen = 0;
	        var tabWidth = context.measureText('    ').width;
	        var charWidth = context.measureText('m').width; 
		var localLines = lines;
		var canvasIndent = 70;
	 	var canvasPos = canvasIndent;
	 	
	 	if(y) lines[y] = '';
	 	
	 	//limit the number of lines we'll process. canvasheight/18 (would be nice to hardcode but dont think thats a goer)
	 	var limit = 800/18;
	 	limit = limit.toFixed(0);
	 	limit += offset;
		if(y) limit = offset+y;
		/*
			if these tokens were by line we could take a SLICE (i think) of the array and reduce the loop below
			i.e. wouldn't need an extra check each iteration to see if we'd done enough
			
			this slice would give us our code "window"
		*/	
		
		//draw line numbers bar
		context.fillStyle = '#333333';
		context.fillRect(0,0,canvasIndent-10,800);
		
		var linePos = 18*y;
		tokens = tokens.slice(offset, limit+1);
		//console.log(tokens);
		var l = offset;
		var thisLine = '';
		for(; l<limit; l++) {
		//while(thisLine = tokens.shift()) {
			tlen = tokens[l].length;
			//console.log('Rendering line '+l);
			//console.log('Line has '+tlen+' tokens');
			linePos = 18*(l-10);
		        for(var x=0;x<tlen;x++) {	        	
		        //while(currentToken = thisLine.shift()) {
		        	currentToken = tokens[l][x];
		        	currentTokenStr = currentToken.str;
		        	style = currentToken.type;
				
				if(currentTokenStr == "\t") {
					canvasPos += tabWidth;
				}
				
				if(style != prevStyle) {
					//render the existing portion of the line that we've found
					context.fillText(bitOfLine, canvasPos, linePos);
					
					canvasPos += charWidth * bitOfLine.length; 
					
					localLines[l] += bitOfLine;
	
					//set the fillStyle for the next context
					//these styles should be defined by the language parer
					//if(style) context.fillStyle = JSParse.styles[style]; else context.fillStyle = '#ffffff';
					//like that except without the object ref each time. maybe copy the parsers styles into 
					//a local array at the top of this function
					if(style == 'keyword') context.fillStyle = '#06ACC2';  // color
					else if(style == 'string') context.fillStyle = '#06C248';  // color  
					else if(style == 'comment') context.fillStyle = '#AAAAAA';  // color 
					else context.fillStyle = '#ffffff';
					
					//start off the next bit of the line
					bitOfLine = currentTokenStr;             
					prevStyle = style;
				} else {
					//OPTIMIZATION POLICE
					//if we've not changed style, then for rendering purposes we may as well keep adding to the string until we've got some reason to 
					//change the fillStyle
					bitOfLine += currentTokenStr;         
				}
		        }
		        
		        
		        //if it's a new line we need to dump out what we have even if the style hasn't changed
			context.fillText(bitOfLine, canvasPos, linePos);
			bitOfLine = '';
			canvasPos = canvasIndent;
			
			//context.fillStyle = 'orange';
			//context.fillText(l+':', 10, linePos);
			//context.fillStyle = '#ffffff';
			
			//l++;
	        }
	        
	        //one call to set the global lines array (better than a call per iteration! hopefully...)
	        //lines = localLines;
	        //lines = document.getElementById('text').value.split("\n");
	        //console.log(lines);
	       
	        if(!y) {
		        context = null;	
		        canvas = null;
		}
	}
	
	this.shiftUp = function() {
    		var data = context.getImageData(0,0,800,18*39);
    		context.clearRect(0, 0, 800, 800);
    		context.putImageData(data, 0, 18);
	}
	
	this.shiftDown = function() {
		var data = context.getImageData(0,18,800,18*40);
    		context.clearRect(0, 0, 800, 800);
		context.putImageData(data, 0, 0);
	}
	
	this.tidy = function() {}
}