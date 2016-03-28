/** @jsx React.DOM */

define('photo-partition', ["linear-partition", "underscore"], function(linear_partition, _) {

    /**
     * Ideal photo distribution
     *
     * Retrieved on 2013-08-13 from http://www.crispymtn.com/stories/the-algorithm-for-a-perfectly-balanced-photo-gallery
     * Modified for use in ineffable by Jesse Patching
     *
     * @param array photos The photos
     * @param integer idealHeight The ideal height of the photos, in pixels.
     * @param integer viewportWidth The viewport width, in pixels
     * @param integer photoPaddingX The horizontal padding on a photo, in pixels
     * @param integer photoPaddingY The verical padding on a photo, in pixels
     */
    var photoPartition = function (photos, idealHeight, viewportWidth, photoPaddingX, photoPaddingY) {
        var summedWidth = _.reduce(photos, function(sum, photo) {
            return sum += photo.aspect_ratio * idealHeight;
        }, 0);

        var rows = Math.round(summedWidth / viewportWidth);
        if (rows < 1) {
            // (2a) Fallback to just standard size
            return [_.map(photos, function(photo) {
                photo.width = parseInt(idealHeight * photo.aspect_ratio, 10) - photoPaddingX;
                photo.height = idealHeight - photoPaddingY;
                return photo;
            })];
        } else {
            // (2b) Distribute photos over rows using the aspect ratio as weight
            var weights = _.map(photos, function(photo) {
                return parseInt(photo.aspect_ratio * 100, 10);
            });
            var partition = linear_partition(weights, rows);

            // (3) Iterate through partition
            var index = 0;
            return _.map(partition, function(row) {
                var summedRatios;
                var rowBuffer = [];

                _.each(row, function() {
                    return rowBuffer.push(photos[index++]);
                });

                summedRatios = _.reduce(rowBuffer, function(sum, photo) {
                    return sum += photo.aspect_ratio;
                }, 0);

                return _.map(rowBuffer, function(photo) {
                    photo.width = parseInt(viewportWidth / summedRatios * photo.aspect_ratio, 10) - photoPaddingX;
                    photo.height = parseInt(viewportWidth / summedRatios, 10) - photoPaddingY;

                    return photo;
                });
            });
        }
    };

    return photoPartition;
});
