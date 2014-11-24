Syntax.prototype.JS = function(customStyle, syntaxObj) {
	var self = this;
	
	var styles = {
	'keyword':'#414CA6',
	'string':'#1B77E0',
	'comment':'#146331',
	'text':'#111111',
	'ops':'#D63E50'
	};
	
	if(customStyle) {
		//merge default as specified options
		$.each(customStyle, function(opt, val) {
			styles[opt] = val;
		});
	}
		
	this.fonts = {
	'keyword':'bold'
	};
	
	/*
		a different approach to styling and syntaxical element detection. 
		here the author can specify style and the matches in one element
	*/
	this.keywordTest = {
		style: '#414CA6',
		values: []
	}
		
	syntaxObj.operators = ['|', '||', '&', '&&', '+', '-', '*', '/', '!', '%', '^', '(', ')', '='];
		
        //any of these characters will cause us to stop and look at things
        //specifically whether we should take any special action, and what is in the str buffer        
	syntaxObj.stopChars = ['(',')',',',' ','.',';', ':', '"', '\'', '/', '{', '}', '[', ']', '/'];
	
	syntaxObj.keywords = ['if', 
	'else', 
	'switch', 
	'alert', 
	'true', 
	'false', 
	'for', 
	'while', 
	'new',
	'this',
	'function',
	'var',
	'default',
	'delete',
	'do',
	'export',
	'enum',
	'extends',
	'prototype',
	'final',
	'finally',
	'float',
	'for',
	'goto',
	'implements',
	'import',
	'instanceof',
	'int',
	'interface',
	'let',
	'long',
	'native',
	'null',
	'package',
	'private',
	'protected',
	'public',
	'short',
	'super',
	'static',
	'syncronised',
	'throw',
	'throws',
	'transient',
	'try',
	'catch',
	'typeof',
	'void',
	'volatile',
	'with',
	'return'
	];
		
	this.functions = {
		'abs':{},
		'acos':{},
		'alert':{},
		'asin':{},
		'atan':{},
		'ceil':{},
		'charAt':{},
		'charCodeAt':{},
		'clear':{},
		'clearInterval':{},
		'clearTimout':{},
		'compile':{},
		'concat':{},
		'confirm':{},
		'cos':{},
		'decodeURI':{},
		'decodeURIComponent':{},
		'encodeURI':{},
		'encodeURIComponent':{},
		'escape':{},
		'eval':{},
		'exec':{},
		'exp':{},
		'floor':{},
		'indexOf':{},
		'isFinite':{},
		'isNaN':{},
		'join':{},
		'lastIndexOf':{},
		'log':{},
		'match':{},
		'max':{},
		'min':{},
		'parseFloat':{},
		'parseInt':{},
		'pop':{},
		'pow':{},
		'prompt':{},
		'push':{},
		'random':{},
		'replace':{},
		'reverse':{},
		'round':{},
		'search':{},
		'setInterval':{},
		'setTimeout':{},
		'shift':{},
		'sin':{},
		'slice':{},
		'sort':{},
		'splice':{},
		'split':{},
		'sqrt':{},
		'substr':{},
		'substring':{},
		'tan':{},
		'test':{},
		'toExponential':{},
		'toFixed':{},
		'toLowerCase':{},
		'toPrecision':{},
		'toString':{},
		'toUpperCase':{},
		'unescape':{},
		'unshift':{},
		'valueOf':{},
		
	}
	
	this.parse = function(source) {
		//console.log('JS passed this source: '+source);
		//TAB HACK!
		if(source == undefined) return;
		if(source == '') return;
		
		source = source.replace(/\t/g, syntaxObj.getEditor().getTab());
		//console.log(this);
		//console.log('parsing: '+source);
		
		
		var checkString = function(currentChar, source, spos, len) {
			//console.log("Searching for "+currentChar+" from position "+spos+" in source '"+source+"'");
			var str = '';
			nextPos = this.lookAhead(currentChar, {pos: spos, len: len, text: source}, function(s) {
				//console.log('String with contents: '+s);
				str = s;
			});
			
			//("\n"");
			//console.log("nextPos: "+nextPos);
			//console.log("charAt nextPos: '"+source.charAt(nextPos)+"'");
			//console.log("charAt nextPos-2: '"+source.charAt(nextPos-2)+"'");
			if(source.charAt(nextPos-2) == '\\') {
				//console.log("charAt nextPos-2 looks like its been escaped, lets keep looking as if nothing happened");
				var slashCount = 1;
				for(var b=nextPos-3; b>=0; b--) {
					//check how many consecutive slashes we have to determine if this is a valid escape sequence or not
					if(source.charAt(b) == '\\') {
						slashCount++;				
					} else {
						break;	//anything other than a slash breaks our search
					}
				}
				
				//an even number of slashes isn't a valid sequence to escape a string
				if(slashCount % 2 == 0) {
					return {str: str, pos: nextPos};	//we return as if we'd never fallen into this check in the first place
				} else {
					return checkString.call(this, currentChar, source, nextPos, len);
				}
			} else {
				return {str: str, pos: nextPos};
			}
		}	
		
		//if one of these chars is the last in the line above (excluding whitespace, tabs etc) then we need to indent
		//this line by the indent of the line above + another indent
		this.indentChars = ['{'];
		this.antiIndentChars = ['}'];	//opposite to above. if one of these is entered decrease the current lines indent
		
        var len = source.length;
        
        //this is our buffer. it tells us what we've read in between stopChars
        var str = '';
        var currentChar = '';
                
        //var inMultiLineComment = false;
        var inString = false;	//object {stringType: " or '}
        var inFunction = false;	//object {function name, limit details}
	
		//let's do some quick checks for strings and multiline comments we might be in
		//if we're in a comment and this line doesn't contain the closing */ pairing, move to the next line
		if(this.inMultiLineComment) {
			if(source.indexOf('*/') == -1) { 
				this.addRegion(styles['comment'], {spos:0, epos:len});
				//tokens[y] = new token(source, 'comment'); 
				return; 
			} else {
				//lets figure out where the comment ends, using the index of */ on this line and set a region
				this.addRegion(styles['comment'], {spos:0, epos:source.indexOf('*/')+2});
				this.inMultiLineComment = false;	//if we have a closing pair, then we'll be out of the comment soon
				return;
				
				//this needs to be extended to allow for something after the end of the multiline comment, on the same line
				//e.g.
				/*
				ml comment
				*/ //end of comment
			}
		}
	
		//console.log(this);
		//console.log('styles:');
		//console.log(styles);
		
	        for(var x=0;x<len;x++) {
	        	
	                currentChar = source.charAt(x);
	                
	                if(this.isA(currentChar, 'stopChars') || this.isOperator(currentChar)) {

			        	if(this.isKeyword(str)) {
				        	this.addRegion(styles['keyword'], {spos:x-str.length, epos:x});
				        	str = '';
				        	x--;

						continue;
			        	}
			        	
			        	if(this.isOperator(str)) {
				        	this.addRegion(styles['ops'], {spos:x-str.length, epos:x});
				        	str = '';
				        	x--;
						continue;
			        	}
			        	
			        	/*
			        	if(currentChar == "\t") {
			        		//TODO: This hardcoded 4 should reference some project variable on how big tabs are
			        		this.addRegion(styles['text'], {spos:x-editor.tab.length, epos:x});
				        	str = '';
				        	x--;
						continue;	
			        	}*/
			        	
			        	
			        	
			        	if(currentChar == "'" || currentChar == '"') {
			        		//if we're already in a string then we need to handle things differently
			        		//i.e. check that this isn't escaped
			        		//if it is look for the next one
			        		//if it's not then update X and fall into the commented code below
						var string = '';
						/*nextPos = this.lookAhead(currentChar, {pos: x+1, len: len, text: source}, function(s) {
							//console.log('String with contents: '+s);
							string = s;
						});
						*/
						
						
						
						var cString = {};
						cString = checkString.call(this, currentChar, source, x+1, len);
						nextPos = cString.pos;
						string = cString.str;
						
						//if we've got something in the buffer then it'll be some normal text, so add that region
	
						//console.log('from source : '+source+', string i found: ' + source.substring(x, nextPos));
						
						//i think this is right
						//console.log("nextpos "+nextPos);
						//console.log("len "+len);
						//console.log("x "+x);
						//console.log(source);
						if(nextPos == undefined) {
							//console.log("string to end of line: "+source);
							//we didn't find the end of the string before the end of the line
							//so set inString and break
							//inString = {stringType: currentChar}
							//set the str buffer to the contents of the string so far
							str += string;
							this.addRegion(styles['string'], {spos: x, epos:len});
							break;
						} else {
							//if we've got something in the buffer then it'll be some normal text, so add that region
							if(str.length > 0) {
				        			this.addRegion(styles['text'], {spos:x-str.length, epos:x});
				        		}


							//notmal case. we found the closing string character in this line					
							this.addRegion(styles['string'], {spos: x, epos:nextPos});
							//console.log('String with contents: '+string);
							//console.log(source);
							//console.log(source.charAt(nextPos-2));
						}
						
						x = nextPos-1;
						str = '';
						continue;
			        	}
			        	
			        				        	
			        	if(currentChar == '/') {	
			        			        		
			        		//if it's a double slash comment
			        		if(source.charAt(x+1) == '/') {	
			        			//if we've got something in the buffer then it'll be some normal text, so add that region
			        			if(str.length > 0) {
				        			this.addRegion(styles['text'], {spos:x-str.length, epos:x});
				        		}	
				        								
							this.addRegion(styles['comment'], {spos:x, epos:len});
							str = '';
							break;
						}
						
						//multi-line comment
						if(source.charAt(x+1) == '*') {							
							this.addRegion(styles['comment'], {spos:x, epos:len});
							str = '';
							this.inMultiLineComment = true;
							break;
						}
						
						//regular expression
						//TODO: Handling is incomplete
						var regexEnd = source.indexOf('/', x+1);
						if(regexEnd !== -1) {
							if(source.charAt(regexEnd+1) == '/') {
								//it's a comment, not the end of the regex
								continue;
							}
							this.addRegion(styles['ops'], {spos:x, epos:regexEnd+1});
							x = regexEnd-1;
							str = '';
							continue;
						}
			        	} 
			        	
			                this.addRegion(styles['text'], {spos:x-str.length, epos: x+1});
	                		str = '';
		                	
	                } else {
	                	str += currentChar;
	                }
	        }	//end each line char loop
	        
	        //if we still have characters in the buffer then flush them out as text
	        if(str != '') {
	        	this.addRegion(styles['text'], {spos:x-str.length, epos: x+1});
	        }
	}
}