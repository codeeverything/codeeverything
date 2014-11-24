Syntax.prototype.HTML = function(source, line) {
	//TAB HACK!
	source = source.replace(/\t/g, '    ');
	
	this.styles = {
	'keyword':'#C90202',
	'string':'#9E812F',
	'comment':'#9E812F',
	'text':'#111111'
	};
	
        //any of these characters will cause us to stop and look at things
        //specifically whether we should take any special action, and what is in the str buffer        
	this.stopChars = ['<','>','/',' ','='];
	
	this.keywords = [];
	
	
	this.checkString = function(currentChar, source, spos, len) {
		//console.log("Searching for "+currentChar+" from position "+spos+" in source '"+source+"'");
		var string = '';
		nextPos = this.lookAhead(currentChar, {pos: spos, len: len, text: source}, function(s) {
			//console.log('String with contents: '+s);
			string = s;
		});
		
		//console.log("nextPos: "+nextPos);
		//console.log("charAt nextPos: '"+source.charAt(nextPos)+"'");
		if(source.charAt(nextPos) == '\\') this.checkString(currentChar, source, nextPos, len);
		else return {str: string, pos: nextPos};
	}	
	
	//if one of these chars is the last in the line above (excluding whitespace, tabs etc) then we need to indent
	//this line by the indent of the line above + another indent
	this.indentChars = ['{'];
	this.antiIndentChars = ['}'];	//opposite to above. if one of these is entered decrease the current lines indent
	
        var len = source.length;
        
        //this is our buffer. it tells us what we've read in between stopChars
        var str = '';
        var currentChar = '';
                
        var inMultiLineComment = false;
        var inString = false;	//object {stringType: " or '}
        var inFunction = false;	//object {function name, limit details}
	
	var inJS = false;
	
	//let's do some quick checks for strings and multiline comments we might be in
	//if we're in a comment and this line doesn't contain the closing */ pairing, move to the next line
	if(inMultiLineComment) {
		if(text.indexOf('*/') == -1) { tokens[y] = new token(text, 'comment'); return; }
		else inMultiLineComment = false;	//if we have a closing pair, then we'll be out of the comment soon
	}
	
	//same sort of thing if we're in a string
	if(inString !== false) {
		var stringEndPos = text.indexOf(inString.stringType)
		if(stringEndPos  == -1) { 
			tokens[y] = new token(text, 'string'); return; 
		} else {
			//we have a string ending char, but is it escaped?
			if(text.charAt(stringEndPos-1) == '\\') { tokens[y] = new token(text, 'string'); return; }
			
			//if we get here then we really do have an end of string to work with
			inString = false;
		}
	}
	
        for(var x=0;x<len;x++) {
                currentChar = source.charAt(x);
                if(this.isStopChar(currentChar)) {
                		//console.log(str);
                		if(str) {
                			this.addRegion(this.styles['text'], {spos:x-str.length, epos: x+1});
                			str = '';
        			}
        			
                		if(currentChar == "=") {
                			
                			if(source.charAt(x+1) == '"') {
			        		var cString = this.checkString(source.charAt(x+1), source, x+2, len);
						nextPos = cString.pos;
						string = cString.str;
						
			        		if(nextPos == undefined) {
							console.log("string to end of line");
							//we didn't find the end of the string before the end of the line
							//so set inString and break
							//inString = {stringType: currentChar}
							//set the str buffer to the contents of the string so far
							str += string;
							this.addRegion(this.styles['string'], {spos: x, epos:len});
							break;
						} else {
							//notmal case. we found the closing string character in this line
							this.addRegion(this.styles['string'], {spos: x, epos:nextPos});
							//console.log('String with contents: '+string);
						}
						
						x = nextPos-1;
						str = '';
						continue;	
					} else {
						
					}
		        	}
		        		   
				if(currentChar == "<") {
		        		//check for a script/style tag
		        		var startIndex = endIndex = 0;
		        		if((startIndex = source.indexOf('<script>', x)) != -1) {
		        			console.log('found a script tag');
		        			
		        			this.addRegion(this.styles['keyword'], {spos:startIndex, epos:startIndex+8});
		        			
		        			if((endIndex = source.indexOf('</script>')) != -1) {
		        				console.log('found closing script on the same line');
		        				console.log(startIndex+','+endIndex);
		        				this.JS(source.substring(startIndex, endIndex));
		        				inJS = false;
		        				
		        				this.engine('HTML');
		        				
		        				this.addRegion(this.styles['keyword'], {spos:endIndex, epos:endIndex+9});
		        				
		        				break;
		        			} else {
		        				inJS = true;
		        				this.engine('JS');
		        			}
		        		} else {
		        			if((endIndex = source.indexOf('</script>')) != -1) {
		        				this.engine('HTML');
		        				
		        				this.addRegion(this.styles['keyword'], {spos:endIndex, epos:endIndex+9});
		        				x+=9;
		        			}
		        		}
		        		
		        		//TODO: This hardcoded 4 should reference some project variable on how big tabs are
		        		var storedX = x;
		        		x++;
		        		while(!this.isStopChar(source.charAt(x))) {
		        			x++;
		        			if(x >= 100) break;
		        		}
		        		
		        		this.addRegion(this.styles['keyword'], {spos:storedX, epos:x});
			        	str = '';
			        	x--;
					continue;	
		        	}
		        	     	
		        	if(currentChar == "\t") {
		        		//TODO: This hardcoded 4 should reference some project variable on how big tabs are
		        		this.addRegion(this.styles['text'], {spos:x-4, epos:x});
			        	str = '';
			        	x--;
					continue;	
		        	}
		        	
		        	
		        	if(currentChar == '/') {
		        		//if it's a closing tag
		        		if(source.charAt(x+1) == '>') {							
						this.addRegion(this.styles['keyword'], {spos:x, epos:x+2});
						str = '';
						//break;
					} else {
						var storedX = x;
			        		x++;
			        		while(!this.isStopChar(source.charAt(x))) {
			        			x++;
			        			if(x >= 100) break;
			        		}
			        		
			        		this.addRegion(this.styles['keyword'], {spos:storedX, epos:x+1});
				        	str = '';
				        	//x--;
						continue;
					}
		        	} 
		        	
		                this.addRegion(this.styles['text'], {spos:x-str.length, epos: x+1});
                		str = '';
	                	
                } else {
                	str += currentChar;
                }
        }	//end each line char loop
        
        //if we still have characters in the buffer then flush them out as text
        if(str != '') {
        	this.addRegion(this.styles['text'], {spos:x-str.length, epos: x+1});
        }
}