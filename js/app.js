
// Global Variables & Default Locations
var map;
var clientID;
var clientSecret;

// Default location for several points
var defaultLocations = [
    {
        title: 'Canna Cruz',
        location: {
            lat: 36.9863342,
            lng: -122.0324849
        }
    },
    {
        title: 'Santa Cruz Naturals',
        location: {
            lat: 36.9757459,
            lng: -121.8882603
        }
    },
    {
        title: 'KindPeoples Collective',
        location: {
            lat: 36.9856965,
            lng: -121.9827407
        }
    },
    {
        title: 'Granny Purps',
        location: {
            lat: 36.9851404,
            lng: -121.9659725
        }
    },
    {
        title: 'Herbal Cruz',
        location: {
            lat: 36.9671524,
            lng: -121.9649442
        }
    },
    {
        title: 'Central Coast Wellness Center',
        location: {
            lat: 37.0721581,
            lng: -122.0840406
        }
    }
];


// Working with the foursquare API
 var Location = function(data) {
    var self = this;
    this.name = data.title;
    this.position = data.location;
    this.URL = '';
    this.street = '';
    this.city = '';
    this.phone = '';

    this.visible = ko.observable(true);

    // Credentials for FOURSQUARE Api
    clientID = 'AEDY4G2EDEFQZUOPU1RZNVMOUX0X25LCTKM0SJQWQPQG24L3';
    clientSecret = '5Y2UT2PWZRKVXBM0GJ5DBGRAXFK02M45XZVLAMYQSZMQVZWT';

    // Foursquare API endpoint build
    var fourSquareURL =  'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170801' + '&query=' + this.name;

    // Gets the data from foursquare and store it into its' own variables.
    $.getJSON(fourSquareURL).done(function (data) {
        var results = data.response.venues[0];
        self.URL = results.url;
        if (typeof self.URL === 'undefined') {
            self.URL = "";
        }

        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = results.contact.phone;
        if (typeof self.phone === 'undefined') {
            self.phone = '';
        }

    }).fail(function () {
        $('.venue-list').html('There was an error with the Foursquare API call. Please refresh the page and try again');
    });

    // This is what the infowindow will contain.
    this.contentString =
        '<div class="info-window-content">' +
        '<div class="title"><b>' + data.title + "</b></div>" +
        '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div>" +
        "</div>";

    // Puts the content string inside Infowindow.
    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    // Placing the markers
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.location.lat, data.location.lng),
        title: data.title,
        map: map
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
            '<div class="title"><b>' + data.title + "</b></div>" +
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


// Working with Google Maps API / View model
function ViewModel(){
    var self = this;

    // Search term is blank by default
    this.searchTerm = ko.observable('');

    // Initializes a blank array for locations
    this.locationList = ko.observableArray([]);

    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 36.9863342, lng: -122.0324849},
        mapTypeControl: false
    });

    // Pushes default locations array into new location list array
    defaultLocations.forEach(function(locationItem){
        self.locationList.push( new Location(locationItem));
    });

    // Searches for what user typed in the input bar using the locationlist array.
    // Only displaying the exact item results that user type if available in the locationlist array.
    this.filteredList = ko.computed( function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem){
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);
}

// Error handling if map doesn't load.
function errorHandling() {
    $('#map').html('We had trouble loading Google Maps. Please refresh your browser and try again.');
}

function runApp() {
    ko.applyBindings(new ViewModel());
    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

