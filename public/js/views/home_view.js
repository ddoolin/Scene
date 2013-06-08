(function ($) {

    // Variable decs
    var scene = window.Scene,
        hc = new scene.HomeController(),
        infoWindow;

    (function getLocation () {
        if (Modernizr.geolocation) {
            if (localStorage.getItem("currentPosition")) {
                createMap(localStorage.getItem("currentPosition"));
            } else {
                navigator.geolocation.getCurrentPosition(createMap);
            }
        } else {
            console.log("Geolocation API not supported");
        }
    })();

    (function connectWS() {
        var socket = window.socket = null;

        if (socket === null) {
            socket = io.connect("/home");
            socket.on("connect", function() {});
            socket.on('message', function(data) {});
            socket.on('disconnect', function() {});
        }

        socket.socket.connect();
        window.socket = socket;
    })();

    function createMap (position) {
        localStorage.setItem("currentPosition", position);
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