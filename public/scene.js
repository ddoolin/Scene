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
};;(function ($) {

    var scene = window.Scene,
          hc = new scene.HomeController();

    (function getLocation () {
        if (Modernizr.geolocation) {
            if (localStorage.getItem("currentLatitude") && localStorage.getItem("currentLongitude")) {
                var latitude = localStorage.getItem("currentLatitude"),
                      longitude = localStorage.getItem("currentLongitude"),
                      position = {
                          coords: {
                              latitude: latitude,
                              longitude: longitude
                          }
                      };

                hc.createMap(position);
            } else {
                navigator.geolocation.getCurrentPosition(hc.createMap);
            }
        } else {
            console.log("Geolocation API not supported");
        }
    })();

    (function connectWS () {
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

    (function setEventHandlers () {
        // Instantiate the login popover
        $("#login").popover({
            html: true,
            placement: "bottom",
            content: function () {
                return $("#login_popover_content").html();
            }
        });

        // Instantiate the datepickers
        $("#from_date").datepicker({
            minDate: new Date(),
            altField: $("#from_date"),
            dateFormat: "m/d/yy"
        });

        $("#to_date").datepicker({
            minDate: new Date(),
            altField: $("#to_date"),
            dateFormat: "m/d/yy"
        });

        // Set the focus handler
        $("#from_time, #to_time").focus(function (event) {
            $(event.target).siblings(".hour-select").show();
        }).keydown(function (event) {
            $(event.target).siblings(".hour-select").hide();
        }).blur(function (event) {
            $(event.target).siblings(".hour-select").hide();
        });

        // Set the default times (pretty complex, needs own method)
        hc.setDefaultTimes();

        $("#create_event_modal").on("shown", function () {
            $("#event_name").focus();
        });
    })();
})(jQuery);;(function ($) {
	'use strict';
	if(!window.Scene)
		window.Scene = {};
	window.Scene.PhotoView = Backbone.View.extend({
		tagName  : "div",
		className : "photo",
		template : _.template("<img src='<?=e.image?>'/>"),
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},
		render: function () {
			var position = this.model.get("position");
			var size	 = this.model.get("size");
			this.$el.css({
				left   : position.x + "px",
				top    : position.y + "px",
				width  : size.width + "px",
				height : size.height + "px",
				"-webkit-transform": "rotate(" + this.model.get("rotation") + "deg)"
			});
			this.$el.html(this.template({e : this.model.toJSON()}));
			return this;
		}
	});
})(jQuery);