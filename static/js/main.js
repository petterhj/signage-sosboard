// 	Main
// ===========================================================================

(function(){
    var ocl = console.log;
    console.log = function() {
        if (window.console && SOSBOARD.debug) {
        	ocl.apply(console, arguments);
        }
    }
})();