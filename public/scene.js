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

    this.formatDate = function (date) {

        // Change from "Wed May 29 2013" to "Wednesday, May 29, 2013" and return
        var date = new Date(date),
            days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                "Friday", "Saturday"],
            day = days[date.getDay()],
            months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            month = months[date.getMonth()],
            monthDay = date.getDate(),
            year = date.getFullYear(),
            formattedDate = day + ", " + month + " " + monthDay + ", " + year;

        return formattedDate;
    }

    this.formatTime = function (date) {

        // Change from "23:0" to "11:00 PM" and return
        var date = new Date(date),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            meridiem = "am",
            formattedTime;

        if (hour > 12) {
            hour = hour - 12,
            meridiem = "pm";
        } else if (hour === 12) {
            meridiem = "pm";
        } else if (hour === 0) {
            hour = 12;
            meridiem = "am";
        }

        formattedTime = hour + ":" + (((minutes < 10) ? "0" : "") + minutes) + " " + meridiem;

        return formattedTime;
    };

    this.createMarker = function (position) {
        var position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
              marker;

        marker = new google.maps.Marker({
            map: window.Scene.map,
            position: position,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        return marker;
    };

    this.createColoredMarker = function (color, position) {
        var position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
            marker,
            image,
            shadow;

        image = new google.maps.MarkerImage("images/" + color + "-marker.png",
            new google.maps.Size(32, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 32));

        shadow = new google.maps.MarkerImage("images/marker-shadow.png",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 32));

        marker = new google.maps.Marker({
            map: window.Scene.map,
            position: position,
            draggable: true,
            animation: google.maps.Animation.DROP,
            shadow: shadow,
            icon: image
        });

        return marker;
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
    };

    this.findOnMap = function () {
        var geocoder = new google.maps.Geocoder(),
              modal = $("#create_event_modal"),
              locationFinder = $("#location_finder_popup"),
              position,
              marker;

        $(".create-event-btn").hide();
        modal.modal("hide");
        locationFinder.fadeIn(600);

        locationFinder.draggable({
            containment: "parent"
        }).draggable("enable");

        setTimeout(function () {
            position = [window.Scene.map.getCenter().lat(), window.Scene.map.getCenter().lng()];
            marker = that.createColoredMarker("blue", position);

            google.maps.event.addListener(marker, "dragend", function () {
                geocoder.geocode({
                    "latLng": marker.getPosition()
                }, function (results, status) {
                    $("#address").val(results[0].formatted_address);
                });
            });
        }, 500);

        $("#find_address").click(function (event) {
            errorBadge = $("#location_finder_popup .badge");
            address = $("#address").val();

            // Badge collapses if no text value
            errorBadge.text("").tooltip("destroy");

            if (address.length < 3) {
                errorBadge.text("!");
                errorBadge.tooltip({
                    title: "Address too short",
                    placement: "left"
                });
                return false;
            }

            geocoder.geocode({
                "address": address
            }, function (results, status) {
                if (status !== "OK" && status !== "ZERO_RESULTS") {
                    errorBadge.text("!");
                    errorBadge.tooltip({
                        title: "Unknown error",
                        placement: "left"
                    });
                    return false;
                } else if (status === "ZERO_RESULTS") {
                    errorBadge.text("!");
                    errorBadge.tooltip({
                        title: "Address not found",
                        placement: "left"
                    });
                    return false;
                }

                marker.setPosition(results[0].geometry.location);
            });
        });

        $("#accept_address").click(function (event) {
            $("#event_location").val($("#address").val());
            marker.setMap(null);
            modal.modal("show");
            $(".create-event-btn").show();
            locationFinder.fadeOut();
        });

        $("#cancel_finder").click(function (event) {
            event.preventDefault();
            $("#address").val("");

            marker.setMap(null);
            modal.modal("show");
            $(".create-event-btn").show();
            locationFinder.fadeOut();
            locationFinder.draggable("disable");
        });
    };

    this.createEvent = function () {
        var geocoder = new google.maps.Geocoder(),
              event = {
                _creator: window.Scene.user._id,
                name: $("#event_name").val(),
                description: $("#event_description").val(),
                address: $("#event_location").val(),
                duration: {
                    starttime: new Date($("#from_date").val() + " " + $("#from_time").val()),
                    endtime: new Date($("#to_date").val() + " " + $("#to_time").val())
                }
            };

        geocoder.geocode({
            "address": event.address
        }, function (results, status) {
            event.location = {
                latitude: results[0].geometry.location.lat(),
                longitude: results[0].geometry.location.lng()
            };

            window.socket.emit("Event.create", event);
            $("#create_event_modal").modal("hide");
        });
    };
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
            socket.on("Event.create", function (event) {
                hc.createColoredMarker("green", [event.location.latitude, event.location.longitude]);
            });
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

        $("#event_submit").click(function (event) {
            event.preventDefault();

            hc.createEvent();
        });

        $("#find_location").click(function (event) {
            event.preventDefault();

            hc.findOnMap();
        });
    })();
})(jQuery);;(function ($) {
	'use strict';
	if(!window.Scene)
		window.Scene = {};
		
	window.Scene.PhotoView = Backbone.View.extend({
		tagName  : "div",
		className : "photo",
		template : _.template("<img src='<%=e.image%>'/>"),
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},
		render: function () {
			var position = this.model.get("position");
			var size	 = this.model.get("size");
			this.$el.css({
				left   : position.x - size.width/2  + "%",
				top    : position.y - size.height/2 + "%",
				width  : size.width + "%",
				height : size.height + "%",
				"-webkit-transform": "rotate(" + this.model.get("rotation") + "deg)"
			});
			this.$el.html(this.template({e : this.model.toJSON()}));
			return this;
		}
	});
})(jQuery);