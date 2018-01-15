
// Global Variables & Default Locations

var map;
var Location;
var clientID;
var clientSecret;

// Default location for several points
var defaultLocation = [
    {
        name: 'Winnemac Park',
        location: {
            lat: 41.9741,
            long: -87.6820
        }
    },
    {
        name: 'Bracher Park',
        location: {
            lat: 37.402,
            long: -122.052
        }
    },
    {
        name: 'Over Easy Cafe',
        location: {
            lat: 41.9718,
            long: -87.6790
        }
    },
    {
        name: 'Hacker Dojo',
        location: {
            lat: 37.402,
            long: -122.052
        }
    },
    {
        name: 'House of Falafel',
        location: {
            lat: 37.322,
            long: -122.018
        }
    },
    {
        name: 'Pho Mai #1 Noodle House',
        location: {
            lat: 37.415,
            long: -121.878
        }
    }
]


// Working with the foursquare API
Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long= data.long;
    this.URL = '';
    this.street = '';
    this.city = '';
    this.phone = '';

    // Credentials for FOURSQUARE Api
    clientID = 'QQFKNQDTD5FQDARWQZSZOPHYWYE1KRZDNRCIAMGZH2RQQHW5';
    clientSecret = 'RYQF20YIJJKN3YROH0BNCYUKJGY4MGFRKDJHSSWDCKPLP2QS';

    // Foursquare API endpoint build
    var fourSquareURL =  'https://api.foursquare.com/v2/venues/search?ll='
        + this.lat + ',' + this.long + '&client_id=' + clientID
        + '&client_secret=' + clientSecret + '&v=20170801' + '&query=' + this.name;

    $.getJSON(foursquareURL, function(data) {
        console.log(data); // making sure data is sent back

        var results = data.response.venues[0];
        self.URL = results.url;
        if (typeof self.URL === 'undefined') {
            self.URL = "";
        }
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = results.contact.phone;
    }).fail(function () {
        $(".venue-list").html('There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.');
    });

    // This is what the infowindow will contain.
    this.contentString =
        '<div class="info-window-content">' +
        '<div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div>" +
        "</div>";

    // Puts the content string inside Infowindow.
    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    // Placing the markers
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    // Setting selected marker visibility.
    this.showMarker = ko.computed(function() {
        if(this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // When marker is clicked on open up infowindow designated to the marker with it's information.
    this.marker.addListener('click', function(){
        self.contentString =
            '<div class="info-window-content">' +
            '<div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
            '<div class="content">' + self.street + "</div>" +
            '<div class="content">' + self.city + "</div>" +
            '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div>" +
            "</div>";

        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, this);

        // Setting bounce animation for markers
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    // Makes the marker bounce animation whenever clicked.
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};


// Working with Google Maps API
function ViewModel(){
    var self = this;

    // Search term is blank by default
    this.searchTerm = ko.observable('');

    // Initializes a blank array for locations
    this.locationList = ko.observableArray([]);

    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 37.370, lng: -122.002},
        mapTypeControl: false
    });

    // Pushes default locations array into new location list array
    defaultLocations.forEach(function(locationItem){
        self.locationList.push( new Location(locationItem));
    });

