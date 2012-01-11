/**
 * Created by JetBrains WebStorm.
 * User: Jon
 * Date: 10/01/12
 * Time: 10:54
 * To change this template use File | Settings | File Templates.
 */
var geoApp = geoApp || {};

/**
 * @constructor
 * @param {string} containerId
 */
geoApp.View = function (containerId) {
    this.container = document.getElementById(containerId);
    this.map = null;
    this.markers = {};
    if (geoApp.mediator) {
        geoApp.mediator.subscribe('userChanged', this.userChanged, this);
    }
};


/**
 * @method userChanged
 * @param {string} userId
 * @param {object} data
 * @returns {boolean}
 */
geoApp.View.prototype.userChanged = function (userId, data) {
    var lat,
        lon,
        loc,
        result = false;

    if (userId && data && data.loc) {

        lat = data.loc.latitude;
        lon = data.loc.longitude;

        // if map not initialised, do so and pass it lat / lon. Otherwise update user pos on map and store new marker
        if (!this.map) {
            result = this._initMap(lat, lon);
        } else {
            loc = this._createMapLocation(lat, lon);
            if (loc) {
                this._centerMap(loc);
                result = true;
            }
        }
    }

    return result;
};

/**
 * @method _centerMap
 * @param {object} loc
 */
geoApp.View.prototype._centerMap = function (loc) {
    this.map.setCenter(loc);
};

/**
 * @method _createMapLocation
 * @param lat
 * @param lon
 */
geoApp.View.prototype._createMapLocation = function (lat, lon) {
    if (!lat || !lon || !google || !google.maps || !google.maps.LatLng) {
        return null;
    }
    return new google.maps.LatLng(lat, lon);
};

geoApp.View._updateMarker = function (lat, lon) {
    this.markers[id] = new google.maps.Marker({
        position: this.createMapLocation(lat, lon),
        map: this.map
    });
};

geoApp.View.prototype._initMap = function(lat, lon) {
    var myOptions = {
        zoom: 15,
        center: this.createMapLocation(lat, lon),
        streetViewControl:true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        navigationControl: true,
        navigationControlOptions:{
            style: google.maps.NavigationControlStyle.DEFAULT
        }
    };
    this.map = new google.maps.Map(this.container, myOptions);
    return (this.map !== null);
};
