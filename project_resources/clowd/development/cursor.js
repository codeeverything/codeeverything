function Cursor(pos) {
    
    this.pos = pos ? pos:{x:0, y:0};
    this.monoCharWidth = context.measureText('m').width;
    this.color = '#000';    //the color of the cursor when it's "on"
    this.dimensions = [2,18];    //the size of the cursor in pixels: x,y
    this.blinkDelay = 500;    //the time between blinks of the cursor (in milliseconds)
    this.editor = editor;    //a pointer back to the editor object
    this.cursorOn = true;    //whether or not the cursor is blinking on or off
    
    //a function to blink the cursor on and off
    this.blink = function() {
        return;
    }
    
    this.advance = function() {
        if(!line) {
            console.log('Error: cursor.advance() requires a line to operate on'); 
            return;
        }

        var line = chLine+1;
        var xpos = context.measureText('m').width;
        context.fillStyle = '#06ACC2';
        context.fillRect(cursorPos[0]+xpos, 18*line, 1, 18);
        cursorPos = [cursorPos[0]+xpos, 18*line];
    }
    
    this.retreat = function(line) {
        if(!line) {
            console.log('Error: cursor.retreat() requires a line to operate on'); 
            return;
        }

        var line = chLine+1;
        //var xpos = (context.measureText(lines[line].substring(0, chPos)).width);
        var xpos = cursorPos[0]-context.measureText('m').width;
        context.fillStyle = '#06ACC2';
        context.fillRect(xpos, 18*line, 1, 18);
        if(xpos < 70) {
            //if we hit the beginning of this line return
            //actually what we want to do is move up to the end of the line above
            return;
        }
        cursorPos = [xpos, 18*line];
    }
    
    this.liftCursor = function() {
        var line = chLine+1;
            context.fillStyle = '#06ACC2';
        context.fillRect(cursorPos[0], 18*(line-1), 1, 18);
        cursorPos = [cursorPos[0], 18*(line-1)];
        
        //if the cursor has moved to a line beyond the code window update this
        //if the cursor is moving to a line below 0 then return
    }
    
    this.dropCursor = function() {
        var line = chLine+1;
            context.fillRect(cursorPos[0], 18*(line+1), 1, 18);
        cursorPos = [cursorPos[0], 18*(line+1)];
        //if the cursor has moved to a line beyond the code window update this
        //if the cursor is moving to a line greater than the number of lines and this isn't a carriage return
        //then return
    }
    
    this.resetCursor = function() {
        var line = chLine+1;
            context.fillRect(cursorPos[0], 18*(line+1), 1, 18);
        cursorPos = [70, 18*(line+1)];
    }
    
    this.getCursor = function() {}
    this.setCursor = function() {}
    
    this.draw = function() {
        //pass in context?
        //in some way clear the existing cursor
        context.clearRect(this.pos.x, this.pos.y, 1, 18);
            //context.clearRect(0, 18*line, 800, 18);

            //get lines in here somehow (or at least the line(s) that are applicable
            for(var c=0; c<lines[line].length; c++) {
                if((context.measureText(lines[line].substring(0, c)).width+10) > x) {
                    //draw the cursor
                    console.log('Guess2: '+lines[line][c-1]);
                    
                    var xpos = (context.measureText(lines[line].substring(0, c-1)).width)+10;
                    context.fillStyle = '#06ACC2';
                    context.fillRect(xpos, 18*line, 1, 18);
                    //cursorPos = [xpos, 18*line];
                    this.pos = {x:xpos, y:18*line};
                    
                    
                    chPos = c;
                    chLine = line;
                    
                    break;
                }
            }
    }
    
    //clear the existing cursor...?
    //might be useful if doing a blinking cursor
    //call draw, wait, call clear, wait, repeat
    this.clear = function() {
        context.clearRect(this.pos.x, this.pos.y, 1, 18);
    }

}