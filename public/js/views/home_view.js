(function ($) {

    // Variable decs
    var scene = window.Scene,
        hc = new scene.HomeController(),
        mapOptions,
        map,
        infoWindow;

    // Options to pass to the map
    mapOptions = {
    };

    (function getLocation () {
        if (Modernizr.geolocation) {
            pos = navigator.geolocation.getCurrentPosition(/* */);
            console.log(pos);
        } else {
            // Fallback?
        }
    })();
})(jQuery);