function test() {
    var translate = 0;

    var saveFile = function() {
        var file = lines.join("\n");
        $.post('saveFile.php', {name: currentFilename, file: file}, function(file) {
            alert('saved');
            //render(true);
        });
    }    
    
    //BUT IT WASNT ENOUGH
    //TEST SAVE
    var insertChar = function(ch, pos, str) {
        //return str.substring(0, pos)+ch+str.substring(pos);
        
            var removeCount = insertOn ? 1:0;
            var strA = str.split('');
            //console.log(strA);
            strA.splice(pos, removeCount, ch);
            return strA.join('');
    }
    
    //removes a character from the string at the given position
    var deleteChar = function(pos, str) {
            var strA = str.split('');
            strA.splice(pos, 1);
            return strA.join('');
    }
    
    //splits a line in two at pos. returns an array of the two lines
    var splitLine = function(line, pos) {
        //console.log(line.match(/^\s+/g)[0]);
        //tab indent - sort of!
        if(line.match(/^\s+/g).length > 0) {
            tabOffset = line.match(/^\s+/g)[0];
        }
        
            return [line.substring(0, pos), tabOffset+line.substring(pos)];
    }
            
    //create a new blank line at position
    var addLine = function(pos, line) {
            lines.splice(pos, 0, line);
    }
    
    //remove a whole line at position
    var removeLine = function(pos) {
            lines.splice(pos, 1);
    }
    
    var joinLine = function(line1, line2) {
        //console.log(line1 +''+ line2);
            return line1 +''+ line2;
    }
}