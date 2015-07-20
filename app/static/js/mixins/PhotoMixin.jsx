/** @jsx React.DOM */

define('photo-mixin', ['react'], function(React) {

    var PhotoMixin = {
        photoUrl: function(type, ext, folder, name) {
            // If it's a .gif, just use the original
            if (ext == 'gif' && type == 'display') {
                ext = 'webm';
                postfix = '_display';
            } else {
                ext = 'jpg';
                if (type == 'original') {
                    postfix = '';
                } else {
                    postfix = '_' + type;
                }
            }

            return 'https://' + Config.s3_bucket + '.s3.amazonaws.com' + '/' + folder + '/' + name + postfix + '.' + ext;
        }
    };

    return PhotoMixin;
});
