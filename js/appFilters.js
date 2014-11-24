app.filter('reverse', function() {
    return function(str) {
        if(!str) return '';

        var reversed = '';
        for(var i=str.length-1; i>=0; i--) {
            reversed += str[i];
        }

        return reversed;
    }
});

app.filter('initialUpper', function() {
    return function(str) {
        if(!str) return '';

        var initialUpper = str[0].toUpperCase();

        return initialUpper + str.slice(1);
    }
});

app.filter('max', function() {
    return function(str, maxValue) {
        if(!parseInt(str) && str !== "0") return 'NaN';

        return parseInt(str) > maxValue ? maxValue : parseInt(str);
    }
});

/**
 * given a number humanise it, by breaking it down and giving it a suffix
 * inject the numberFilter filter as well as we want to use that to format part of our output
 */
app.filter('humaniseNumber', ['numberFilter', function(numFilter) {
    return function(val) {
        var units = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion'];
        var divCount = 0;

        //only bother humanising numbers > 100000
        if(val > 1000000) {
            //keep dividing by 1000 until we get a number less than that
            //incrementing a counter (which I suppose is like the power to which 1,000 must be raised to get the original)
            //for example, 1,500,000 can be divided by 1000 2 times before giving us 1.5
            //therefore the number is 1.5 * (1000 ^ 2) = 1,500,000
            while (val >= 1000 && divCount < units.length - 1) {
                val = val / 1000;
                divCount++;
            }

            //first pass the number to numberFilter (built in to Ng) to prettify it
            //then return this string plus the humanised suffix
            return numFilter(val.toFixed(2)) + ' ' + units[divCount];
        } else {
            //people can handle numbers <= 1 million, just return it
            return numFilter(val);
        }
    }
}]);