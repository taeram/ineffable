/** @jsx React.DOM */

define('photo-mixin', ['react'], function(React) {

    var PhotoMixin = {
        photoUrl: function(type, ext, folder, name) {
            var ext = 'jpg';
            if (type == 'original') {
                postfix = '';
            } else {
                postfix = '_' + type;
            }

            // If it's a .gif, don't use the _display.jpg, use the original .gif
            if (type == 'display' && ext == 'gif') {
                postfix = '';
                ext = 'gif';
            }

            return 'https://' + Config.s3_bucket + '.s3.amazonaws.com' + '/' + folder + '/' + name + postfix + '.' + ext;
        }
    };

    return PhotoMixin;
});
