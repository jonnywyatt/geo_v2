var geoApp = geoApp || {};

geoApp.init = function () {
    
    geoApp.model = new geoApp.Model();

    geoApp.mediator = {
        subscribe: function(channel, fn){
            if (!geoApp.mediator.channels[channel]) geoApp.mediator.channels[channel] = [];
            geoApp.mediator.channels[channel].push({ context: this, callback: fn });
            return this;
        },

        publish: function(channel){
            if (!geoApp.mediator.channels[channel]) return false;
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, l = geoApp.mediator.channels[channel].length; i < l; i++) {
                var subscription = geoApp.mediator.channels[channel][i];
                subscription.callback.apply(subscription.context, args);
            }
            return this;
        },

        channels: {}

    };
};

geoApp.destroy = function () {
    geoApp.model = null;
    geoApp.mediator = null;
};
    
