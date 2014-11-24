/*
* A wrapper for all parsers
* Specific parsers will EXTEND (prototype) this object
*/
function Syntax() {
    
    //use a binary tree to store user functions and variables, along with language functions and variables
    //as we parse the users input we check this tree for a match, or a partial match to find possible matches so
    //the user doesn't have to type the whole thing in - and to give hints on the argument functions expect
    //also attach some logic so we only need to do this in instances where the input might be a function or variable
    //??
    var str = '';
        var regions = {};
        var currentChar = '';
        var stopChars = [];
        var keywords = [];
        
    this.isKeyword = function(keyword) {
        return this.keywords.indexOf(keyword) != -1;
    }
    
    this.isStopChar = function(ch) {
        return this.stopChars.indexOf(ch) != -1;
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
    
    this.addRegion = function(style, region) {
        //console.log(regions);
        if(!regions[style]) regions[style] = [];
        regions[style].push(region);
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