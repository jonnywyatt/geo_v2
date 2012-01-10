
describe("Model tests", function () {
    
    beforeEach(function () {
        geoApp.init();
    });

    afterEach(function () {
        geoApp.destroy();
    });

    describe("_getLocation method", function () {

        it("returns a location object", function () {
            var callback = jasmine.createSpy("getLocation");
            spyOn(navigator.geolocation, 'watchPosition').andCallFake(function () {
                callback();
            });
            geoApp.model._getLocation(callback)
            expect(callback).toHaveBeenCalled();
        });
    });

    describe("_userChange method", function () {

        var data;

        beforeEach(function() {
           data = {
                'jonnywyatt@yahoo.co.uk': {
                    label: 'JW',
                    loc: {
                        latitude: -51.5000,
                        longitude: 0.0359
                    }
                }
            };
        });

        it("updates a blank users array", function () {
            geoApp.users = {};
            geoApp.model._userChange(data);
            expect(typeof geoApp.model.users['jonnywyatt@yahoo.co.uk'] === "object").toBe(true);
            expect (geoApp.model.users['jonnywyatt@yahoo.co.uk'].label === "JW").toBe(true);
        });
    });

    describe("_initWebsocket method", function () {

        it("returns false if not passed a string for url", function () {
            var result = geoApp.model._initWebsocket(null, function () {});
            expect(result).toBe(false);
        });

        it("returns false if not passed a function for callback", function () {
            var result = geoApp.model._initWebsocket('ws://endpoint', null);
            expect(result).toBe(false);
        });

        it("returns true if passed endpoint url and function", function () {
            var result = geoApp.model._initWebsocket('ws://endpoint', function () {});
            expect(result).toBe(true);
        });
        
    });

});