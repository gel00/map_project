var map;
// Create a new blank array for all locations.
var locations = []
// Create a new blank array for all the listing markers.
var markers = [];
// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];
// Style the markers a bit. This will be our listing marker icon.
var defaultIcon;

// Create a "highlighted location" marker color for when the user
// mouses over the marker.
var highlightedIcon;


// Google maps callback that initialize map.
function initMap() {
    // Create a styles array to use with the map.
    var styles = [{
        featureType: 'water',
        stylers: [{
            color: '#19a0d8'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
                color: '#ffffff'
            },
            {
                weight: 6
            }
        ]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -40
            }
        ]
    }, {
        featureType: 'transit.station',
        stylers: [{
                weight: 9
            },
            {
                hue: '#e85113'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
                visibility: 'on'
            },
            {
                color: '#f0e4d3'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -25
            }
        ]
    }];

    // Constructor creates a new map - only center and zoom are required.

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 46.249981,
            lng: 20.147891
        },
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });

    // Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    highlightedIcon = makeMarkerIcon('FFFF24');

    // Create locations
    textSearchPlaces();

    //fitBounds method to make sure map markers always fit on screen as user resizes their browser window
    google.maps.event.addDomListener(window, 'resize', function() {
    map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
}   );

}

function googleMapErrorHandler(msg, url, lineNo, columnNo, error) {
    alert("Google maps didn't loaded properly.");
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        console.log('Script Error: See Browser Console for Detail');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log(message);
    }


    return false;
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            this.marker.setIcon(defaultIcon);
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

// This function will loop through the markers array and display them all.
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}




// This function firest when the user select "go" on the places search.
// It will do a nearby search using the entered query string or place.
function textSearchPlaces() {
    var bounds = map.getBounds();
    hideMarkers(placeMarkers);
    var placesService = new google.maps.places.PlacesService(map);
    placesService.nearbySearch({
        location: map.center,
        radius: 30000,
        type: ["museum"]
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            createMarkersForPlaces(results);
            locations = results;
            ko.applyBindings(new ViewModel());
        }
    });
}

// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
    var bounds = new google.maps.LatLngBounds();
    placeMarkers = [];
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        // Create a marker for each place.
        var marker = new google.maps.Marker({
            map: map,
            icon: defaultIcon,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id
        });

        // Create a single infowindow to be used with the place details information
        // so that only one is open at once.
        var placeInfoWindow = new google.maps.InfoWindow();
        // If a marker is clicked, do a place details search on it in the next function.

        marker.addListener('click', function() {
            if (placeInfoWindow.marker == this) {
                console.log("This infowindow already is on this marker!");
            } else {
                this.setIcon(highlightedIcon);
                getPlacesDetails(this, placeInfoWindow);
                map.panTo(marker.getPosition());
            }
        });

        /*marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });
*/
        placeMarkers.push(marker);
        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
    if (infowindow.marker) {
        infowindow.marker.setIcon(defaultIcon);
    }
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: marker.id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Set the marker property on this infowindow so it isn't created again.
            infowindow.marker = marker;
            var innerHTML = '<div>';
            if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
                // Wikipedia request
                loadWiki(place.name);
            }
            if (place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
            }
            if (place.formatted_phone_number) {
                innerHTML += '<br> tel:' + place.formatted_phone_number;
            }
            if (place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
            }
            if (place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl({
                    maxHeight: 100,
                    maxWidth: 200
                }) + '">';
            }
            innerHTML += '<div class="wikiElem"></div><br></div>';
            infowindow.setContent(innerHTML);
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                this.marker.setIcon(defaultIcon);
                infowindow.marker = null;
            });
        }
    });
}
/*--------------------View Model-------------------*/

// Construtor for places
var Elem = function(elem) {
    this.location = elem;
    this.name = ko.observable(elem.name);
    // Show infoWindow when clicked
    this.show = function() {
        var index = locations.indexOf(elem);
        google.maps.event.trigger(placeMarkers[index], 'click');
        //alert(index);
    };
    this.visibility = ko.observable(true);
};
// ViewModel that controlls the sidebarlist and the filter
var ViewModel = function() {
    var self = this;
    //Observed list of places
    this.list = ko.observableArray([]);
    locations.forEach(function(elem) {
        self.list.push(new Elem(elem));
    });
    // This function get the results filtered
    this.filter = function(data, event) {
        filteredList = [];
        var filter = event.target.value.toUpperCase();;
        self.list().forEach(function(elem, index) {
            if (elem.name().toUpperCase().indexOf(filter) > -1) {
                elem.visibility(true);
                console.log(index);
                placeMarkers[index].setMap(map);
                filteredList.push(elem.location);
            } else {
                elem.visibility(false);
                placeMarkers[index].setMap(null);
            }
        });
    };
};
// Loads wikipedia article
function loadWiki(location) {
    var wikipediaURL = 'http://hu.wikipedia.org/w/api.php?action=opensearch&search=' + location + '&format=json&callback=wikiCallback';

    var wikiError = setTimeout(function() {
        $wikiElem.text("Wikipedia Links Are Not Availavle");
    }, 8000);

    $.ajax({
        url: wikipediaURL,
        dataType: "jsonp",
        success: function(response) {
            var articleList = response[1];
            var articleStr = articleList[0];
            if (articleStr) {
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $(".wikiElem").append('<li><a href="' + url + '">' + articleStr + '</a></li>');
            } else {
                $(".wikiElem").append('<p>no wikipedia result</p>');
            }


            clearTimeout(wikiError);
        }
    });
}
