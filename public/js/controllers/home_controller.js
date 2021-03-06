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
            zoom: 14,
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

        marker = that.createColoredMarker("yellow", [lat, lng]);

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
            draggable: false,
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

        window.Scene.map.setCenter(position);

        return marker;
    };

    this.createInfoWindow = function (marker, event) {
        var markup = "<div class='content'>";

            if (event.image) {
                markup += "<img src='" + event.image + "' class='photo' />";
            }

            markup += "<a class='first-heading' href='/events/" + event._id +  "''>" + event.name +
                "</a><div class='body-content'>" +
                "<p class='time'>" + that.formatDate(new Date(event.duration.starttime)) +
                " @ " + that.formatTime(new Date(event.duration.starttime)) + "</p>";

            if (window.Scene.user) {
                markup += "<p class='description logged'>" + event.description + "</p>" +
                "<a class='attend-event' href='#'>Attend this event</a>";
            } else {
                markup += "<p class='description'>" + event.description + "</p>";
            }

            markup += "</div></div>";

        google.maps.event.addListener(marker, "click", function () {
            window.Scene.infoWindow.setContent(markup);
            window.Scene.infoWindow.open(window.Scene.map, this);
            $(".attend-event").on("click", function (evt) {
                evt.preventDefault();

                window.socket.emit("User.attendEvent", {
                    user: window.Scene.user._id,
                    event: event._id
                });

                that.addAttendingEvent(event);
            });
        });
    };

    this.populateMap = function () {
        var events = window.Scene.events;

        _.each(window.Scene.events, function (event) {
            marker = that.createMarker([event.location.latitude, event.location.longitude]);
            that.createInfoWindow(marker, event);
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
		window.Scene.map.setCenter(results[0].geometry.location);
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
                image: $("#event_photo").val(),
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

    this.createUser = function () {
        var data = {
            name: $("#signup_username").val(),
            email: $("#signup_email").val(),
            password: $("#signup_password").val()
        };

        $.ajax({
            url: "/register",
            method: "POST",
            data: data,
            success: function (data, textStatus, jqXHR) {
                window.location.href = "/";
            },
            error: function () {
                console.log("Error");
            }
        });
    };

    this.attemptLogin = function () {
        console.log("Here");
    };

    this.addAttendingEvent = function (event) {
        var markup = "<div class='event'>" +
            "<div class='event-name'><a href='/events/" + event._id + "'>" + event.name + "</a></div>" +
            "<div class='event-duration'>" + moment(event.duration.starttime).format("MM/DD h:mma") +
            " ~ " + moment(event.duration.endtime).format("MM/DD h:mma") + "</div>" +
            "<div class='event-location'>" + event.address + "</div></div>";

        $("#sidebar .events").prepend(markup);
    };

    this.addSpot = function () {
        if ($(".spot-text").val()) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                "address": $(".spot-text").val()
            }, function (results, status) {
                if (results) {
                    var data = {
                        user: window.Scene.user._id,
                        spot: {
                            latitude: results[0].geometry.location.lat(),
                            longitude: results[0].geometry.location.lng(),
                            address: results[0].formatted_address
                        }
                    };

                    window.socket.emit("User.addSpot", data);
                }
            });
        }
    };

    this.renderSpot = function (spot) {
        var spot = spot.spot,
              markup = "<div class='spot'><a class='spot-address' href='#' data-lat='" + spot.latitude +
            "' data-lng='" + spot.longitude + "'>" + spot.address + "</a></div>";

        $("#sidebar .spots").prepend(markup);
        el = $("#sidebar .spot").get(0)
	el = $(el).find(".spot-address");
        $(el).click(function (event) {
            event.preventDefault();

            that.centerSpot($(el).data("lat"), $(el).data("lng"));
        });
    };

    this.centerSpot = function (lat, lng) {
	console.log(lat, lng);
        var latLng = new google.maps.LatLng(lat, lng);

        window.Scene.map.setCenter(latLng);
    };
};
