window.Scene.HomeController = function () {

    // Variable decs
    var that = this;

    this.createMap = function (position) {
        localStorage.setItem("currentLatitude", position.coords.latitude);
        localStorage.setItem("currentLongitude", position.coords.longitude);

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

        that.populateMap();
    };

    this.populateMap = function () {
        var events = window.Scene.events;

        _.each(window.Scene.events, function (event) {
            var position = new google.maps.LatLng(event.location.latitude, event.location.longitude),
                  marker = new google.maps.Marker({
                      map: window.Scene.map,
                      position: position,
                      animation: google.maps.Animation.DROP,
                      title: event.name
            });
        });
    };

    this.setDefaultTimes = function () {
        var date = new Date(),
            hour = date.getHours() + 1;

        $("#from_date").val((date.getMonth() + 1) + "/" + ((hour >= 24) ? date.getDate() + 1 : date.getDate()) + "/" + date.getFullYear());
        $("#to_date").val((date.getMonth() + 1) + "/" + (((hour + 1) >= 24) ? date.getDate() + 1 : date.getDate()) + "/" + date.getFullYear());

        $("#from_time").val(((hour > 12) ? hour - 12 : hour) + ":00 " + ((hour === 24 || hour < 12) ? "am" : "pm"));
        $("#to_time").val(
            (((hour + 1) > 12)
            ? ((hour + 1) > 24)
                ? Math.ceil((hour + 1) / 2) - 12
                : (hour + 1) - 12
            : (hour + 1)) + ":00 " + (((hour + 1) >= 24 || (hour + 1) < 12) ? "am" : "pm")
        );
    }
};