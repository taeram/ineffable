/** @jsx React.DOM */

define('gallery-mixin', ['react'], function(React) {

    var GalleryMixin = {
        retrievePhotos: function(folder, modified, successCallback, errorCallback) {
            $.ajax({
                url: 'https://' + Config.s3_bucket + '.s3.amazonaws.com/' + folder + '/photos.json?d=' + modified,
                success: successCallback,
                error: errorCallback
            });
        }
    };

    return GalleryMixin;
});
