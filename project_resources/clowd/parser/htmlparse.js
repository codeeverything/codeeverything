Parser.prototype.HTMLParse = function(source, line) {
	if(context == undefined) {
		//alert('undefined');
		context = 'global';
	}
	
        var text = source;
        var len = text.length;
        var x = 0;


	var stopChars = ['<','>',' ','=',"\n","\t", '"', '\''];
	function isStopChar(ch) {
		for(var x=0; x<stopChars.length;x++) {
			if(stopChars[x] == ch) return true;
		}
		
		return false;
	}

	
        var str = '';
        var tokens = [];
        var currentChar = '';
        
        for(x=0;x<len;x++) {
                //document.getElementById('output').innerHTML += currentChar;
                currentChar = text.charAt(x);
                
                if(isStopChar(currentChar)) {
                	if(!limited) {
                		if(currentChar == '<') {
                			nextPos = lookAhead(['>'], function(name) {
                				
                				
                				
                				/*
                					PARSE THE HTML TAG CONTENTS
                					We're looking for key=value pairs which will be highlighted as such
                					<span class="htmlkey">id</span>=<span class="string">"somevalue"</span>
                					
                					Also parse out the type of the tag (the tagName variable hacke dup below)
                				*/
                				
                				//HACK TIME - dont do it like this!
                				//for(var i=0;i<name.length;i++) {	
                				//}
                				x += name.length;
                				
                				name = name.split(' ');	//split on spaces
                				if(name.length > 0) {
	                				tokens.push(new token(name[0].replace(/\</g, '&lt;'), 'htmltag'));
	                				for(var i=1;i<name.length;i++) {
	                					name[i] = name[i].split('=');	//split into key=value pairs
	                					
	                					//style
	                					tokens.push(new token(' ', ''));
	                					tokens.push(new token(name[i][0], 'htmlkey'));
	                					tokens.push(new token('=', ''));
	                					tokens.push(new token(name[i][1], 'string'));
	                				}
	                			} else {
	                				name = name.replace(/\</g, '&lt;');
		                			name = name.replace(/\>/g, '&gt;');
		                			
							tokens.push(new token(name, 'htmltag'));
	                			}
                				
                				
                				
                				console.log('tag: '+name);
						//name = name.replace(/\</g, '&lt;');
	                			//name = name.replace(/\>/g, '&gt;');
	                			
						//tokens.push(new token(name, 'htmltag'));
						
						
						
						/*
                				if we find a script tag then find the end of the opener (parsing the tag as we go...)
                				once we find the end of the opener, find the start of the close tag, reading in each char as we go
                				if we've read in nothing, or just \t\s or \n then just output
                				otherwise pass the string we found to JSParse
                				take the returned tokens from JSParse and add them to our tokens array
                				
                				same sort of setup for STYLE tag but passing to a CSSParse() function
                				
                				*/
                				
                				var tagName = name[0];
                				
                				
						if(tagName == '<script') {
							alert('found script');
	                				nextPos = lookAhead('/script>', function(script) {
	                					script = script.replace('<\/script>','');
	                					alert(script);
	                					var JSTokens = JSParse(script);
								for(var i=0; i<JSTokens.length;i++) 
									tokens.push(JSTokens[i]);
	                				});
	                				
	                				str = '';
	                				
	                				return nextPos;
                				} 
					});                		
						
					x = nextPos;
					
			        	str = '';
					continue;
                		}
                		
                		//|| currentChar == '>'
                		if(currentChar == '=' ) {
                			//nextPos = lookAhead(' ', function(name) {
						str = str.replace(/\</g, '&lt;');
	                			str = str.replace(/\>/g, '&gt;');
	                			
						tokens.push(new token(str+currentChar, 'keyword'));
						
					//});                		
						
					//x = nextPos;
					
			        	str = '';
					continue;
                		}
                		
                		if(currentChar == '>' ) {
                			//tokens.push(new token('&gt;', 'keyword'));
                			nextPos = lookAhead(['<'], function(str) {
						str = str.replace(/\</g, '');
	                			str = str.replace(/\>/g, '&gt;');
	                			
						tokens.push(new token(str, ''));
						
					});                		
						
					//x = nextPos;
					
			        	str = '';
					continue;
                		}

		        	if(currentChar == "'" || currentChar == '"') {
		        		x++;
		        		nextPos = lookAhead([currentChar], function(s) {
		        			s = s.replace(/\</g, '&lt;');
		                		s = s.replace(/\>/g, '&gt;');
						tokens.push(new token(currentChar+s, 'string'));
						console.log('String with contents: '+s);
					});                		
					
					x = nextPos;
					str = '';
					continue;
		        	}
		        }
	                
	                str = str.replace(/\</g, '&lt;');
	                str = str.replace(/\>/g, '&gt;');
	                tokens.push(new token(str, ''));
	                tokens.push(new token(currentChar, ''));
                	str = '';
                } else {
                	str += currentChar;
                }
        }
        
     	return tokens;
}