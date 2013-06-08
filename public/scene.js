// Avoid polluting the global namespace

window.Scene = {};;window.Scene.HomeController = function () {

    // Variable decs
    var that = this;
};;(function ($) {

    // Variable decs
    var scene = window.Scene,
        hc = new scene.HomeController(),
        infoWindow;

    (function getLocation () {
        if (Modernizr.geolocation) {
            navigator.geolocation.getCurrentPosition(createMap);
        } else {
            console.log("Geolocation API not supported");
        }
    })();

    (function connectWS() {
        var socket = null;

        if (socket === null) {
            socket = io.connect("/home");
            socket.on("connect", function() {});
            socket.on('message', function(data) {});
            socket.on('disconnect', function() {});
        }

        socket.socket.connect();
    })();

    function createMap (position) {
        var lat = position.coords.latitude,
              lng = position.coords.longitude,
              map,
              mapOptions;

        // Options to pass to the map
        mapOptions = {
            center: new google.maps.LatLng(lat, lng),
            zoom: 12,
            streetViewControl: false,
            panControl: false,
            mapTypeControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        window.Scene.map = map;
    }
})(jQuery);