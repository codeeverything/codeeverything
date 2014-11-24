Parser.prototype.JSParse = function(source, line) {
	if(context == undefined) {
		//alert('undefined');
		context = 'global';
	}
	
	this.styles = {
	'keyword':'color',
	'string':'color',
	'comment':'color'
	};
	
        //any of these characters will cause us to stop and look at things
        //specifically whether we should take any special action, and what is in the str buffer        
	var stopChars = ['(',')',',',' ','.',';',"\n","\t", '"', '\'', '/'];
	
	var keywords = ['if', 
	'else', 
	'switch', 
	'alert', 
	'true', 
	'false', 
	'for', 
	'while', 
	'new',
	'this'
	];
	
	
	var text = '';
        var len = 0;
        var x = 0;
        
        //this is our buffer. it tells us what we've read in between stopChars
        var str = '';
        var tokens = [];
        var currentChar = '';
        
        //we'll use this one day to get tokens by line
        //how functions are parsed has me confused right now. 
        //it is a friday and i am tired! :)
        var line = 0;
        
        var inMultiLineComment = false;
        var inString = false;	//object {stringType: " or '}
        var inFunction = false;	//object {function name, limit details}
        var sourceLines = source.split("\n");
        var numLines = sourceLines.length;
        for(var y=0; y<numLines; y++) {
        	len = sourceLines[y].length;
        	text = sourceLines[y];
        	tokens[y] = [];
        	
        	//let's do some quick checks for strings and multiline comments we might be in
        	//if we're in a comment and this line doesn't contain the closing */ pairing, move to the next line
        	if(inMultiLineComment) {
        		if(text.indexOf('*/') == -1) { tokens[y] = new token(text, 'comment'); continue; }
        		else inMultiLineComment = false;	//if we have a closing pair, then we'll be out of the comment soon
        	}
        	
        	//same sort of thing if we're in a string
        	if(inString !== false) {
        		var stringEndPos = text.indexOf(inString.stringType)
        		if(stringEndPos  == -1) { 
        			tokens[y] = new token(text, 'string'); continue; 
        		} else {
        			//we have a string ending char, but is it escaped?
        			if(text.charAt(stringEndPos-1) == '\\') { tokens[y] = new token(text, 'string'); continue; }
        			
        			//if we get here then we really do have an end of string to work with
        			inString = false;
        		}
        	}
        	
	        for(x=0;x<len;x++) {
	                //document.getElementById('output').innerHTML += currentChar;
	                currentChar = text.charAt(x);
	                
	                if(isStopChar(currentChar)) {
	                	if(!limited) {
	                		//checking for empty strings/spaces up here saves about 40% time!
	                		/*if(str == ' ') {
	                			tokens.push(new token(str, ''));
	                			tokens.push(new token(currentChar, ''));
			                	str = '';
			                	continue;
	                		}*/
	                		
		                	if(str == 'function') {
		                		tokens[y].push(new token(str, 'keyword'));
		                		var fname = '';
						nextPos = lookAhead('(', function(name) {
							console.log(name);
							tokens.push(new token(name, ''));
							
							//HACK
							fname = name;
							if(fname !== '(') fname = 'RANDOM_NAME_'+fname;
							
							//if(context !== 'global') alert('found function "'+fname+'" within a function: '+context);
							return lookAhead(')', function(args) {
								args = args.replace(/\s/g, '').split(',');
								console.log(args);
							});
							
						});                		
						
						x = nextPos;
						/*
						//HACK!
						var funcstr = "";
						var openbrackets = 0;
						var closebrackets = 0;
				        	//var lookLen = lookFor.length;
						for(var j=x; j<len; j++) {
							if(text.charAt(j) == '{') {
								//Optimization Police: open and closebrackets don't seem to need to be arrays. 
								//Just use INTs and do a ++ on them.  I bet that's quicker than a push
								//and the check for equivalence will be easier at the end too.
								openbrackets++;
							} else if(text.charAt(j) == '}') {
								closebrackets++;
							} 
							
							funcstr += text.charAt(j);
							
							if(openbrackets == closebrackets) {
								if(openbrackets.length == closebrackets.length) {
									//alert(funcstr);
									console.log('Found end of function '+fname+' at '+j);
									break;
								}
							}
						}
		
			        		console.log('Function declaration followed by: '+currentChar);

			        		var funcTokens = JSParse(funcstr, false, fname);
						tokens.concat(funcTokens);
	
						tokens[y].push(new token(')', ''));
						
			        		x = j;
			        		*/
			        		str = '';
						continue;
			        	}
			        	
			        	if(isKeyword(str)) {
				        	tokens[y].push(new token(str, 'keyword'));
						x--;
				        	str = '';
						continue;
			        	}
			        	
			        	
	//merge this with the keyword check above? that way we only check for 'var' when we know it's a keyword anyway
			        	if(str == 'var') {
				        	tokens[y].push(new token(str, 'keyword'));
				        	//tokens.push(new token(currentChar, ''));
				        	
				        	nextPos = lookAhead(['=',',',';'], function(name) {
							console.log('Found variable: '+name);
							console.log('Context is: '+context);
							console.log(variables);
							tokens[y].push(new token(name, 'variable'));
							
							//alert(context);
							name = name.replace(/[=\s]/g, '');
							//if(!variables[context]) variables[context] = {};
							//rather than reference the global here we could probably copy the array into a local variable at the top of the function
							//then work on it here
							//then update the global just once at the end
							//may be quicker
							if(!variables[context]) variables[context] = [];
							variables[context].push(name);
						});                		
							
						x = nextPos;
						
				        	str = '';
						continue;
			        	}
			        	
			        	if(currentChar == "'") {
			        		x++;
			        		
			        		//if we're already in a string then we need to handle things differently
			        		//i.e. check that this isn't escaped
			        		//if it is look for the next one
			        		//if it's not then update X and fall into the commented code below
			        		var theString = '';
			        		nextPos = lookAhead("'", function(s) {
			        			theString = s;
							tokens[y].push(new token(currentChar+s, 'string'));
							console.log('String with contents: '+s);
						});                		
						
						x = nextPos-1;
						
						/*
						//i think this is right
						if(x == len) {
							//we didn't find the end of the string before the end of the line
							//so set inString and break
							inString = {stringType: "'"}
							//set the str buffer to the contents of the string so far
							str += 
							break;
						} else {
							//notmal case. we found the closing string character in this line
							tokens[y].push(new token(currentChar+s, 'string'));
							console.log('String with contents: '+s);
						}
						*/	
						str = '';
						continue;
			        	}
			        	
			        	if(currentChar == '"') {
			        		x++;
			        		nextPos = lookAhead('"', function(s) {
			        			//s = s.replace(/\</g, '&lt;');
			                		//s = s.replace(/\>/g, '&gt;');
							tokens[y].push(new token(currentChar+s, 'string'));
							console.log('String with contents: '+s);
						});                		
						
						x = nextPos-1;
						str = '';
						continue;
			        	}
			        	
			        	if(currentChar == '/') {
			        		//x++;
			        		//if it's a double slash comment
			        		if(text.charAt(x+1) == '/') {
				        		nextPos = lookAhead("\n", function(s) {
				        			//s = s.replace(/\</g, '&lt;');
				                		//s = s.replace(/\>/g, '&gt;');
								tokens[y].push(new token(s, 'comment'));
								//comment is followed by a \n token
								tokens[y].push(new token("\n", ''));
								console.log('Comment with contents: '+s);
							});     
							
							x = nextPos-1;
							str = '';
							continue;           		
						}
						/*
						if(text.charAt(x+1) == '*') {
							//alert('multi line');
							var count = 0;
		
							x++;
							nextPos = lookAhead("/", function(s) {
				                		//what we need to do is pass this into this parsing function again
				                		//but perhaps with a flag to let us know we're in a comment
				                		//this will then pass back new lines etc but ignore other tokens
								//tokens.push(new token('/'+s, 'comment'));
								tokens[y].push(new token('/', ''));
								var commentTokens = JSParse(s, true);
								for(var i=0; i<commentTokens.length;i++) 
									tokens[y].push(new token(commentTokens[i].str, 'comment'));
	
								console.log('Comment with contents: '+s);
							});  
					
							x = nextPos;
		
							str = '';
							continue;	
						}
						*/
			        	}
			        }
		                
		                tokens[y].push(new token(str, ''));
		                tokens[y].push(new token(currentChar, ''));
	                	str = '';
	                } else {
	                	str += currentChar;
	                }
	        }	//end each line char loop
        }	//end line loop
        
        //console.log(variables);
	//console.log(tokens);
     	return tokens;
}