/*
* A wrapper for all parsers
* Specific parsers will EXTEND (prototype) this object
*/
function Parser() {
	
	var variables = {};
	
	//??
	var str = '';
        var tokens = [];
        var currentChar = '';
        
	this.isKeyword = function(ch) {
		return keywords.indexOf(keyword) != -1;
	}
	
	this.isStopChar = function(ch) {
		return stopChars.indexOf(ch) != -1;
	}
	
	this.lookAhead = function(lookFor, callback) {
		var argstr = "";
        	var lookLen = lookFor.length;
        	console.log(typeof lookFor);
        	if(typeof lookFor == 'string') {
			//for(var j=x; j<len; j++) {
			for(var j=x; j<len; j++) {
				//for(var k=0;k<lookLen;k++) {
					console.log('Looking for "'+lookFor+'" at pos ['+j+','+(j+lookLen)+']');
					console.log('FOUND: '+text.substring(j, j+lookLen));
					if(text.substring(j, j+lookLen) == lookFor) {
					//if(text.substring(j, j+lookLen) == lookFor) {
						console.log('Started at pos: '+x+', Found '+lookFor+' at pos '+j+', argstr: '+argstr);
						callback(argstr+text.substring(j, j+lookLen));
						str += argstr+text.substring(j, j+lookLen);
						
						return j+lookLen;
					} else {
						argstr += text.charAt(j);
					}
				//}
			}
			//argstr += text.substring(j, j+lookLen);	
		} else {
			for(var j=x; j<len; j++) {
				for(var k=0;k<lookLen;k++) {
					if(text.charAt(j) == lookFor[k]) {
					//if(text.substring(j, j+lookLen) == lookFor) {
						console.log('Started at pos: '+x+', Found "'+lookFor[k]+'" at pos '+j+', argstr: '+argstr);
						callback(argstr+text.charAt(j));
						str += argstr+text.charAt(j);
						
						return j;
					} else {
						
					}
				}
				
				argstr += text.charAt(j);
			}
		}
	}
	
	function token(str, type) {
		this.str = str;
		this.type = type;
	}	
	
	

}