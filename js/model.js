/**
 * Created by JetBrains WebStorm.
 * User: Jon
 * Date: 05/01/12
 * Time: 09:59
 * To change this template use File | Settings | File Templates.
 */

var geoApp = geoApp || {};

geoApp.Model = function () {
    this.users = {};
    this.localUser = null;
    this._setupThisUser();
    this._setupRemoteUsers();
};

/**
 * @method _setupThisUser
 * @returns {void}
 */
geoApp.Model.prototype._setupThisUser = function () {
    var that = this;

    this._getLocation(function (response) {
        var data;
        
        if (response && response.coords) {

            data = {
                'jonnywyatt@yahoo.co.uk': {
                    label: 'JW',
                    loc: response.coords
                }
            };
            that._userChange(data);
            that.localUser = 'jonnywyatt@yahoo.co.uk';
        }
    });
};

/**
 * @method _publishUserChanged
 * @param {string} userId
 * @param {object} data
 * @returns {void}
 */
geoApp.Model.prototype._publishUserChanged = function (userId, data) {
    if (geoApp.mediator) {
        geoApp.mediator.publish('userChanged', userId, data);
    }
};

/**
 * @method _setupRemoteUsers
 * @returns {void}
 */
geoApp.Model.prototype._setupRemoteUsers = function () {
    this._initWebsocket('ws://jw-geoapp.appspot.com/users:8080', this._userChange);
};

/**
 * @method _userChange
 * @param {object} data
 * @returns {boolean} true if at least one item in users array was updated
 */
geoApp.Model.prototype._userChange = function (data) {
    var key,
        result = false;

    if (!this.users || !data || (typeof data !== "object")) {
        return result;
    }
    for (key in data) {
        if (data.hasOwnProperty(key)) {
            this.users[key] = data[key];
            this._publishUserChanged(key, this.users[key]);
            result = true;
        }
    }
    return result;
};

/**
 *
 * @method _initWebsocket
 * @param {string} endpoint
 * @param {function} callback
 * @returns {boolean} - was websocket initialised correctly and onmessage handler attached
 * @testable
 * @tested
 */
geoApp.Model.prototype._initWebsocket = function (endpoint, callback) {
    var result = false,
        socket = null;

    if (!endpoint || !callback) {
        return false;
    }
    
    try {
        socket = new WebSocket(endpoint);
    } catch (err) {
        socket = null;
    }

    if (socket) {
        socket.onmessage = function (event) {
            var parsedJSON;
            if (typeof event === "string") {
                parsedJSON = JSON.parse(event);
                if (typeof parsedJSON === "object") {
                    callback(parsedJSON);
                }
            }
        };
        if (typeof socket.onmessage === 'function') {
            result = true;
        }
    }
    return result;
};

/**
 * @method _getLocation
 * @param {function} callback
 * @returns {void}
 * @testable
 * @tested
 */
geoApp.Model.prototype._getLocation = function (callback) {
    if (callback) {

        if (navigator && navigator.geolocation && navigator.geolocation.watchPosition) {
            navigator.geolocation.watchPosition(
                callback,
                function () {
                    callback(false);
                },
                {
                    enableHighAccuracy:true,
                    maximumAge:30000,
                    timeout:27000
                }
            );
        } else {
            callback(false);
        }
    }
};
