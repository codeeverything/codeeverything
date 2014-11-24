/**
 * A totally unnecessary directive to all us to have a "tab" element, which will put in a number of spaces
 * as specified in the "size" attribute or a default
 */
app.directive('tTab', function() {
    return {
        restrict: 'E',
        scope: {
            size: '=size'
        },
        template: '{{tab}}',
        link: function($scope, element) {
            if(!$scope.size) $scope.size = 4;

            var template = '';
            for(var i=0; i<$scope.size; i++) {
                template += '\u00A0';
            }

            //element.html(template);
            $scope.tab = template;
        }
    };
});

app.directive('cronTime', function($interval) {
    return {
        restrict: 'E',
        scope: {
            //isolate the scope so you could have multiple of these directives with some customisation on a page
        },
        template: '{{time}}',
        link: function($scope, element) {

            //function to pad a string to a given width with a character
            var pad = function(n, width, padding) {
                padding = padding || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
            }

            //get the current time and format as hh:mm:ss
            var doTime = function() {
                var d = (new Date());
                $scope.time = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
            };

            //render the time immediately, don't wait for the first interval to come along
            doTime();

            //refresh every second
            $interval(doTime, 1000);
        }
    };
});

app.directive('cronTimer', function($interval) {
    return {
        restrict: 'E',
        template: '{{secondsPassed}} {{message}}',
        link: function($scope, element, attrs) {

            var startTime = (new Date()).getTime();
            //we don't have access to an isolated scope in here, so pull the message from the attrs and pop in the scope
            $scope.message = attrs.message;

            //get the current time and format as hh:mm:ss
            var doTime = function() {
                var secondsPassed = (new Date()).getTime() - startTime;
                secondsPassed /= 1000;  //convert from milliseconds
                $scope.secondsPassed = Math.floor(secondsPassed);
            };

            //render the time immediately, don't wait for the first interval to come along
            doTime();

            //refresh every second
            $interval(doTime, 1000);
        }
    };
});

app.directive('helpHint', function() {
    return {
        restrict: 'E',
        transclude: true,
        //isolate the scope, though we don't actually set anything in here. just so that one helpicon doesn't interfer with another
        scope: {
        },
        templateUrl: 'app/partials/angularexamples/helphint.html',
        controller: function($scope) {

            $scope.toggleDisplay = function($event) {

                console.log('toggled');
                $scope.toggle = !$scope.toggle;

                if($scope.toggle) {
                    var helpIcon = $event.target;
                    //get the element that actually holds the help text for this help hint
                    var helpContent = helpIcon.nextElementSibling;

                    var rect = helpIcon.getBoundingClientRect();
                    //we now need to position this bad boy
                    var x = rect.left + rect.width;
                    var y = rect.top + rect.height;
                    helpContent.style.left = x + 'px';
                    helpContent.style.top = y + 'px';
                }
            }
        },
        link: function($scope, element, attrs) {
            //setup some initial values
            $scope.helpicon = attrs.helpicon || '[?]';
            $scope.toggle = false;
        }
    };
});


app.directive('formPassword', function() {
    return {
        restrict: 'E',
        transclude: true,
        //isolate the scope
        scope: {
            size: '@',
            min: '@',
            max: '@',
            pattern: '@',
            placeholder: '@',
            name: '@'
        },
        templateUrl: 'app/partials/angularexamples/formpassword.html',
        controller: function($scope) {
            //
        },
        link: function($scope, element, attrs, ctrl, transclude) {
            //setup some default values - these are optional configs
            $scope.min = attrs.min || 8;
            $scope.max = attrs.max || 20;
            $scope.pattern = attrs.pattern || '/./';

            //set the password to blank
            $scope.password = "";

            //use the extra argument "transclude" to transclude our content and specify the scope
            //to be the directive's, otherwise we'll lose our handle on the arguments specified and
            //reference the scope of the controller this directive lives in
            transclude($scope, function(clone, scope) {
                element.append(clone);
            });

            console.log($scope);
        }
    };
});

app=.directive('fake', function() {
   return {};
});