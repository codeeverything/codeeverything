function Document(editor) {
    this.name = 'default';
    this.lines = [];
    this.cursor = new cursor(null, editor);    //each document has it's own cursor
    this.selection = {};    //each document has it's own selection as well
    this.edits = [];    //I guess edits are made on a per document basis as well
    //edits should contain details on the number of edits aggregated into the posted/stored edit. We can then interrogate the document to see how many edits it took to create 
    //and further break this down into edit types like inserts, deletions, copies, pastes, moves etc
    var editingUsers = {};    //users who have some sort of handle on this document
    
    var syntaxParserIdent = '';    //generally the editor will pick a parser based on the documents extension, but we may want to use something else
    
    //the users currently editing this document
    var editingUsers = [];
    
    this.loadDocument = function(fileString, fname) {
        //alert(fileString);
        var lines = fileString.split("\n");
        var tab = editor.getTab();
        
        //replace a \t with the tab string to get the correct spacing when highlighting text
        for(var i=0;i<lines.length;i++) {
                lines[i] = lines[i].replace(/\t/g, tab);    //would it be quicker to run this on the fileString before splitting?
            }
            
            this.lines = lines;    //move the local var lines to the class var
            this.name = fname;
        //console.log(this.lines);
    }
    
    //get the text for the specified line
    this.getLine = function(line) {
        return this.lines[line];
    }
    
    //return the full text of the document (in an array)
    this.getLines = function() {
        return this.lines;
    }
    
    this.findText = function(text) {}
    this.replaceText = function(text) {}
    
    this.splitLine = function(line, pos) {
        var tabOffset = 0;
        try {
            if(line.match(/^\s+/g).length > 0) {
                tabOffset = line.match(/^\s+/g)[0];
            }
        } catch(e) {}
        
        return [line.substring(0, pos), tabOffset+line.substring(pos)];
    }
    
    this.joinLines = function(line1, line2) {
    
    }
    
    this.deleteChar = function(pos, str) {
            var strA = str.split('');
            strA.splice(pos, 1);
            return strA.join('');
    }
    
    this.deleteLine = function() {}
    
    this.deleteBlock = function() {}
    
    this.copySelection = function() {}
    
    this.paste = function() {}
    
    //the width of a givin char. because we use mono-spaced fonts (for now) each char will be this width
        //var charWidth = context.measureText('m').width;
        //var tabWidth = charWidth * this.tabSize;
        
        //      COULD INSERT AND DELETE CHAR BE WRITTEN AS EXTENSIONS TO THE STRING OBJECT?
        //      IS THAT A GOOD IDEA?
        
        //adds a character to the string at the given position
        this.insertChar = function(ch, pos, str) {
                var strA = str.split('');
                strA.splice(pos, 0, ch);
                return strA.join('');
        }
        
        this.updateLine = function(line, text) {
            this.lines[line] = text;
            //alert(this.lines[line]);
            //alert(this.lines);
        }
        
        //removes a character from the string at the given position
        var deleteChar = function(pos, str) {
                var strA = str.split('');
                strA.splice(pos, 1);
                return strA.join('');
        }
        
        //splits a line in two at pos. returns an array of the two lines
        var splitLine = function(line, pos) {
                return [line.substring(0, pos), line.substring(pos)];
        }
        
        var joinLine = function(line1, line2) {
                return line1.concat(line2);
        }
        
        var deleteChunk = function(lspos, lepos, cspos, cepos) {
                //if we're only removing chars from a single line
                if(lspos == lepos) { lines[spos] = lines[lspos].substring(0, cspos)+lines[spos].substring(cepos); }
                
                //otherwise we're removing a selection that spans several lines
                //hmmm
                //remove each full line with a loop calling removeLine
                //for
                //      removeLine(x);
                //loop
                //now join the start and end lines at cspos and epos
                //return lines[lspos].substring(0, cspos)+lines[lepos].substring(cepos);
        }
        
        //insert some text at a given cursor pos
        var insertChunk = function(ins, line, pos) {
                //need to think about inserts that contain line breaks/multiple lines
                lines[line] = lines[line].substring(0, pos)+ins+lines[line].substring(pos);
        }
        
        var getChunk = function(selection) {
                //return the text in the selection
        }
        
        //create a new blank line at position
        var addLine = function(pos) {
                lines.splice(pos, 0, '');
        }
        
        //remove a whole line at position
        var removeLine = function(pos) {
                lines.splice(pos, 1);
        }
    
    
   //find instances of the search text in the selection (if applicable)
    
   var find = function(search, selection) {
    
           //selection will be something like: {sline, eline, spos, epos}, so lets get a string of all of that
    
           
    
           var line = selection.sline;     //start at this line
    
           var instances = [];     //matches
    
           
    
           // COULD USE REGULAR EXPRESSION MATCHES HERE RATHER THAN INDEXOF (MAY WELL BE EASIER!)
    
           
    
           //this will handle a full search as well
    
           if(selection.sline != selection.eline) {
    
                   //check for a full search: selection: = {0, num of lines, 0, 0}
    
                   // a simple, if selection.full would be nicer...
    
                   if(selection.sline == 0 && selection.eline == lines.length && selection.spos == 0 && selection.epos == lines[lines.length].length)
    
                           var selectedLines = lines;
    
                   else 
    
                           var selectedLines = lines.slice(selection.sline, selection.eline);      //the lines from the global that are in the selection
    
           
    
                   
    
                   
    
                   //these special cases are good, but only match 1 instance in the lines...
    
                   //handle the first line as a special case
    
                   var idx = selectedLines.shift().indexOf(search, selection.spos);
    
                   if(idx != -1) instances.push([line, idx]);
    
           
    
                   //treat the last line as a special case
    
                   idx = selectedLines.pop().indexOf(search);
    
                   if(idx <= selection.epos) instances.push([line, idx]);
    
           
    
                   //check each full line in the selection
    
                   idx = 0;
    
                   while(curLine = selectedLines.shift()) { 
    
                          if(curLine.indexOf(search, idx) != -1) instances.push([line, idx]);
    
                           //increment our line pointer
    
                           line++;       
    
                   }
    
           } else {
    
                   //just a single line to check
    
                   var idx = -1;   //hmm
    
                   line = selection.sline;
    
                   do {
    
                           idx = lines[line].indexOf(search, idx);
    
                           instances.push([line, idx]);  
    
                           line++;      
    
                   } while(idx != -1)
    
           }
    
           
    
           //all done. did we find anything?
    
           return instances.length > 0 ? instances:false;
    
   }
    
   
    
   var findPrev = function() {
    
           return this.find(search, selection, startIndex, direction);     //?
    
   }
    
   var findNext = function() {}
    
   var replaceNext = function() {}
    
   var replacePrev = function() {}
    
   
    
   var toUpper = function(str) {
    
           return str.toUppercase();
    
   }
    
   
    
   var toLower = function(str) {
    
           return str.toLowerCase();
    
   }
    
   
    
   //functions to move about the document (i.e. to jump between locations)
    
   var previousPosition = function() {}
    
   var nextPosition = function() {}
    
   
    
   var gotoLine = function(line) {}
    
   
    
   var count = function(search, selection) {
    
           return this.find(search, selection).length;
    
   }
    
   
    
   var replace = function(search, replace, selection, opts) {
    
           //opts should be: g and i (global [all], i [case insensitive])
    
           //var instances = this.find(search, selection);   //find instances to replace. really?...
    
           instances.each = function(i, v) {
    
                   lines[v[0]] = lines[v[0]].replace(/search/opts, replace);
    
           }
    
           
    
           //OR
    
           //replace all of the search in the string
    
           //return str.replace(/search/opts, replace);
    
   }
    
   
    
   var getSelection = function() {
    
           //hmm
    
           return {sline: 0, eline: 0, spos: 0, epos: 0};
    
   }
    
   
    
   var getSelectedLines = function(selection) {
    
           //check for a full search: selection: = {0, num of lines, 0, 0}
                // a simple, if selection.full would be nicer...
                if(selection.sline == 0 && selection.eline == lines.length && selection.spos == 0 && selection.epos == lines[lines.length].length)
                        return lines;
                else 
                        return lines.slice(selection.sline, selection.eline);      //the lines from the global that are in the selection
    
   }
    
   
    
   
    
   //given a cursor position, figure out which character in which line we clicked on
    
   var getCharPos = function(cursor) {
    
           //cursor: {x:,y:}
    
           var line = lines[cursor.y/lineheight.toFixed(0)];
    
           var x = cursor.x;
    
           
    
           var cPos = Math.ceil(x/this.charWidth);
    
           
    
           return cPos > line.length ? line.length:cPos;
    
   }
    
   
    
   var getStringWidth = function(str) {
    
           var width = 0;
    
           
    
           //loop until we find no more tabs. adding to width as we go
    
           //kinda do this with strings a bit. maybe we need a handler function findAllInstances(ch), or countInstancesOf(ch), or str.indexOfAll(ch)
    
           //OR could use regular expression matches
    
           //var tabW = = str.match(/\t/g).length * tabWidth;
    
           
    
           var tabIdx = -1;
    
           if(tabIdx = (str.indexOf("\t") != -1)) {
    
                   width += tabWidth;
    
           }
    
           
    
           return (str.length * charWidth) + tabW;
    
   }
    
   
    
   var changeLine = function(line) {
    
           this.changedLines[line] = true;
    
   }
    
   
    
   var lineChanged = function(line) {
    
           return this.changedLines[line];
    
   }
    
   
    
   var getChangedLines = function() {
    
           return this.changedLines;
    
   }
    
   
   
   //undo/redo
   /*
       we'll keep X of these on the client side, surrounding the current point (i.e. X +- Y)
       but the rest we'll push to the server. 
       as our position changes we'll push and pull data from the server to keep things fluid on the client
   */ 
   var addActionHistory = function(action) {
   
   }
   
   
    
   
    
   //check if the coords of pos are within the bounds of isin
    
   // pos: {x: 0, y: 0}, isin: {x: 0, y:0, x2: 0, y2: 10}
    
   //probably used by cursor object
    
   //thought of this because you can't click and drag a selection in bespin. would be handy if you could :)
    
   var within = function(pos, isin) {
    
           return pos.x >= isin.x && pos.y >= isin.y && pos.x <= isin.x2 && pos.y <= isin.y2;
    
   }
}