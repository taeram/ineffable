/** @jsx React.DOM */

define('photo', ['react', 'jquery'], function(React, $) {

    var Photo = React.createClass({
        url: function (type) {
            return 'https://' + Config.s3_bucket + '.s3.amazonaws.com' + '/' + this.props.folder + '/' + this.props.name + '_' + type + '.jpg';
        },

        showLightbox: function () {
            var css = {
                background: 'rgba(0, 0, 0, .75) url("' + this.url('display') + '")',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                height: '100%',
                left: 0,
                position: 'fixed',
                textAlign: 'center',
                top: 0,
                width: '100%',
                zIndex: 1099
            };

            $('<div class="photo-lightbox">')
                .css(css)
                .click(function(e) {
                    $(e.target).remove();
                })
                .appendTo(document.body);
        },

        render: function() {
            var imgStyle = {
                width: this.props.width,
                height: this.props.height
            };

            return (
                <div className="gallery-photo" onClick={this.showLightbox}>
                    <img src={this.url('thumb')} style={imgStyle} />
                </div>
            );
        }
    });

    return Photo;
});
