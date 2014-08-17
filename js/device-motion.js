/*
 *
 * Device Orientation API
 * http://www.w3.org/TR/orientation-event/
 */

var DeviceMotionControl = {
    /*
     * init
     * Initialize the object
     */
    init: function() {

    },
    /*
     * isDeviceMotionEventSupported
     * Check if the devicemotion event is supported
     * @returns {Boolean}
     */
    isDeviceOrientationEventSupported: function() {
        if (window.DeviceOrientationEvent) {
            return true;
        }

        return false;
    },
    /*
     * isDeviceMotionEventSupported
     * Check if the devicemotion event is supported
     * @returns {Boolean}
     */
    isDeviceMotionEventSupported: function() {
        if (window.DeviceMotionEvent) {
            return true;
        }

        return false;
    },
    /*
     * handleMotionEvent
     * Listen to the devicemotion event and invoke the callback function every time the event is fired
     * @param {Function} callback
     */
    handleMotionEvent: function(callback) {

        /* In Safari for iOS the direction are reversed on axes x and y */
        var implementationFix = 1;
        if (window.navigator.userAgent.match(/^.*(iPhone|iPad).*(OS\s[0-9]).*(CriOS|Version)\/[.0-9]*\sMobile.*$/i)) { // is Mobile Safari
            implementationFix = -1;
        }

        /* Check whether the DeviceMotionEvent is supported */
        if (this.isDeviceMotionEventSupported()) {

            /* Add a listener for the devicemotion event */
            window.ondevicemotion = function(deviceMotionEvent) {

                /* Get acceleration on x, y and z axis */
                var x = deviceMotionEvent.accelerationIncludingGravity.x * implementationFix;
                var y = deviceMotionEvent.accelerationIncludingGravity.y * implementationFix;
                var z = deviceMotionEvent.accelerationIncludingGravity.z;

                /* Get the interval (ms) at which data is obtained from the underlying hardware */
                var interval = deviceMotionEvent.interval;

                /* Handle the screen orientation */
                ScreenOrientationManager.handleOrientation({
                    portraitPrimaryCallback: function() {
                        callback(-x, y, z, interval);
                    },
                    landscapePrimaryCallback: function() {
                        callback(y, x, z, interval);
                    },
                    portraitSecondaryCallback: function() {
                        callback(-y, -x, z, interval);
                    },
                    landscapeSecondaryCallback: function() {
                        callback(x, -y, z, interval);
                    }
                });
            };
        }
//        else {
//            alert('devicemotion event not supported');
//        }
    }
};