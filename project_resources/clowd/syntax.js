/*
* A wrapper for all parsers
* Specific parsers will EXTEND (prototype) this object
*/
function Syntax(editor) {
	
	var self = this;
	
	//??
	var str = '';
        var regions = {};
        var currentChar = '';
        var stopChars = [];
        var keywords = [];
        var inMultiLineComment;
        
        this.getEditor = function() {
        	return editor;
        }
        
        this.variables = {};
        this.getVars = function() {
        	return this.variables;
        }
        
        var xengine = 'JS';
        
        this.inMultiLineComment = false;
        
        this.engine = function(eng) {
        	if(eng) {
        		//console.log(editor.getOptions().style.syntax[eng]);
        		//this[eng].styles = editor.getOptions().style.syntax[eng];
        		//console.log('engine styles');
        		//console.log(this[eng].styles);
        		var styling = editor.getOptions();
        		if(styling['style']) style = styling['style'].syntax[eng];
        		else style = null;
        		
        		xengine = new this[eng](style, self);
        		//console.log(this);
        		//xengine.styles = editor.getOptions().style.syntax[eng];
        		//console.log(xengine);
        		//xengine = eng;
        	}
        	return xengine;
        }
        
        this.highlight = function(source) {
        	//try {
	        	//this[xengine](source);
	        	xengine.parse.call(self, source);
	        //} catch(e) {
	        	//the engine probably didn't exist (nasty way of dealing with this)
	        	//try the TXT engine
	        	//this.engine('TXT');
	        	//this.TXT(source);
	        	//alert(source);
	        	//console.log(e.description);
	        	//console.log('error calling parse');
	        //}
        }
        
        //Copyright 2009 Nicholas C. Zakas. All rights reserved.
	//MIT-Licensed, see source file
	var binarySearch = function(items, value){
	
	    var startIndex  = 0,
	        stopIndex   = items.length - 1,
	        middle      = Math.floor((stopIndex + startIndex)/2);
	
	    while(items[middle] != value && startIndex < stopIndex){
	
	        //adjust search area
	        if (value < items[middle]){
	            stopIndex = middle - 1;
	        } else if (value > items[middle]){
	            startIndex = middle + 1;
	        }
	
	        //recalculate middle
	        middle = Math.floor((stopIndex + startIndex)/2);
	    }
	
	    //make sure it's the right value
	    return (items[middle] != value) ? -1 : middle;
	}
	
	//a generic test to see if isThis belongs to the array oneOfThese
	//This should allow people to define their own set of important elements in a text
	this.isA = function(isThis, oneOfThese) {
		return this[oneOfThese].indexOf(isThis) != -1;
	}
	
	this.isKeyword = function(keyword) {
		return this.keywords.indexOf(keyword) != -1;
		//return binarySearch(this.keywords, keyword) != -1;
	}
	
	this.isStopChar = function(ch) {
		return this.stopChars.indexOf(ch) != -1;
	}
	
	this.isOperator = function(ch) {
		return this.operators.indexOf(ch) != -1;
	}
	
	this.lookAhead = function(lookFor, data, callback) {
		var x = data.pos;
		var len = data.len;
		var text = data.text;
		
		
		var argstr = "";
        	var lookLen = lookFor.length;
        	//console.log(typeof lookFor);
        	if(typeof lookFor == 'string') {
			for(var j=x; j<len; j++) {
					//console.log('Looking for "'+lookFor+'" at pos ['+j+','+(j+lookLen)+']');
					//console.log('FOUND: '+text.substring(j, j+lookLen));
					if(text.substring(j, j+lookLen) == lookFor) {
						//console.log('Started at pos: '+x+', Found '+lookFor+' at pos '+j+', argstr: '+argstr);
						callback(argstr+text.substring(j, j+lookLen));
						str += argstr+text.substring(j, j+lookLen);
						
						return j+lookLen;
					} else {
						argstr += text.charAt(j);
					}
			}
		} else {
			for(var j=x; j<len; j++) {
				for(var k=0;k<lookLen;k++) {
					if(text.charAt(j) == lookFor[k]) {
						//console.log('Started at pos: '+x+', Found "'+lookFor[k]+'" at pos '+j+', argstr: '+argstr);
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
	
	this.region = function(spos, epos) {
		this.spos = spos;
		this.epos = epos;
	}	
	
	var lastAddedRegion = {};
	this.addRegion = function(style, region) {
		//console.log('adding region');
		//console.log(regions);
		if(!regions[style]) regions[style] = [];
		if(lastAddedRegion.style == style && region.spos == lastAddedRegion.epos) {
			//this region has the same style as the last one and starts where that one ended, just append to it
			regions[style][regions[style].length-1].epos = region.epos;
		} else {
			//add a new region
			regions[style].push(region);
		}
		
		lastAddedRegion = {style: style, spos: region.spos, epos: region.epos};		
	}
	
	this.addToLastRegion = function(style) {
		if(regions[style]) {
			regions[style][regions[style].length-1].epos++;
		}
	}
	
	this.popRegion = function (style) {
		if(regions[style]) regions[style].pop();
	}
	
	this.getRegions = function() {
		return regions;
	}
	
	this.clearRegions = function() {
		regions = {};
	}
}