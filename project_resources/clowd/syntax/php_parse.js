/*
Syntax highlighting rules for the PHP language
TODO: PHP files commonly have contents that are a mixture of PHP and HTML (which can itself be a mixture of HTML, JavaScript and CSS). So a canny parser will spot these differences in context and defer to another
parser for those parts. For now this will work for pure PHP files only
*/
Syntax.prototype.PHP = function(source, line) {
	//alert(source);
	//console.log('JS passed this source: '+source);
	//TAB HACK!
	if(source == undefined) source = '';
	
	source = source.replace(/\t/g, '    ');
	
	
	this.styles = {
	'keyword':'#414CA6',
	'string':'#44A641',
	'comment':'#9E812F',
	'text':'#111111',
	'ops':'#D63E50',
	'variable':'#1B7AE0'
	};
	
	
	
	this.fonts = {
	'keyword':'bold'
	};
	
	this.operators = ['|', '||', '&', '&&', '+', '-', '*', '/', '!', '%', '^', '(', ')', '='];
	
        //any of these characters will cause us to stop and look at things
        //specifically whether we should take any special action, and what is in the str buffer        
	this.stopChars = ['=','(',')',',',' ','.',';', ':', '"', '\'', '/', '{', '}', '[', ']'];
	
	this.keywords = ['if', 
	'echo',
	'else', 
	'switch', 
	'alert', 
	'true', 
	'false', 
	'foreach', 
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
	
	this.isVariable = function(str) {
		if(str.charAt(0) == '$') return true;
		else return false;
	}
	
	this.isPHPTag = function(str) {
		if(str == '<?' | str == '?>' | str == '<?php') return true;
		else return false;
	}
	
	this.checkString = function(currentChar, source, spos, len) {
		console.log("Searching for "+currentChar+" from position "+spos+" in source '"+source+"'");
		var string = '';
		nextPos = this.lookAhead(currentChar, {pos: spos, len: len, text: source}, function(s) {
			//console.log('String with contents: '+s);
			string = s;
		});
		
		//("\n"");
		console.log("nextPos: "+nextPos);
		console.log("charAt nextPos: '"+source.charAt(nextPos)+"'");
		console.log("charAt nextPos-2: '"+source.charAt(nextPos-2)+"'");
		if(source.charAt(nextPos-2) == '\\') {
			console.log("charAt nextPos-2 looks like its been escaped, lets keep looking as if nothing happened");
			this.checkString(currentChar, source, nextPos, len);
		}
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
                
        //var inMultiLineComment = false;
        var inString = false;	//object {stringType: " or '}
        var inFunction = false;	//object {function name, limit details}

	//let's do some quick checks for strings and multiline comments we might be in
	//if we're in a comment and this line doesn't contain the closing */ pairing, move to the next line
	if(this.inMultiLineComment) {
		if(source.indexOf('*/') == -1) { 
			this.addRegion(this.styles['comment'], {spos:0, epos:len});
			//tokens[y] = new token(source, 'comment'); 
			return; 
		} else {
			//lets figure out where the comment ends, using the index of */ on this line and set a region
			this.addRegion(this.styles['comment'], {spos:0, epos:source.indexOf('*/')+2});
			this.inMultiLineComment = false;	//if we have a closing pair, then we'll be out of the comment soon
			return;
			
			//this needs to be extended to allow for something after the end of the multiline comment, on the same line
			//e.g.
			/*
			ml comment
			*/ //end of comment
		}
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
		        	if(this.isKeyword(str)) {
			        	this.addRegion(this.styles['keyword'], {spos:x-str.length, epos:x});
			        	str = '';
			        	x--;
					continue;
		        	}
		        	
		        	if(this.isOperator(str)) {
			        	this.addRegion(this.styles['ops'], {spos:x-str.length, epos:x});
			        	str = '';
			        	x--;
					continue;
		        	}
		        	
		        	if(this.isVariable(str)) {
			        	this.addRegion(this.styles['variable'], {spos:x-str.length, epos:x});
			        	str = '';
			        	x--;
					continue;
		        	}
		        	
		        	if(this.isPHPTag(str)) {
			        	this.addRegion(this.styles['ops'], {spos:x-str.length, epos:x});
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
					
					
					var cString = this.checkString(currentChar, source, x+1, len);
					nextPos = cString.pos;
					string = cString.str;
					
					//i think this is right
					/*console.log("nextpos "+nextPos);
					console.log("len "+len);
					console.log("x "+x);
					*/
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
		        	}
		        	
		        	//hash comment
		        	if(currentChar.charCodeAt(0) == 35) {				
					this.addRegion(this.styles['comment'], {spos:x, epos:len});
					str = '';
					break;
		        	}
		        				        	
		        	if(currentChar == '/') {
		        		//if it's a double slash comment
		        		if(source.charAt(x+1) == '/') {							
						this.addRegion(this.styles['comment'], {spos:x, epos:len});
						str = '';
						break;
					}
					
					//multi-line comment
					if(source.charAt(x+1) == '*') {							
						this.addRegion(this.styles['comment'], {spos:x, epos:len});
						str = '';
						this.inMultiLineComment = true;
						break;
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