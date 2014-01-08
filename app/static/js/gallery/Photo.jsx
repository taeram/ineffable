/** @jsx React.DOM */

define('photo', ['react', 'jquery'], function(React, $) {

    var Photo = React.createClass({
        url: function () {
            return 'https://' + Config.s3_bucket + '.s3.amazonaws.com' + '/' + this.props.folder + '/' + this.props.name + '_' + this.props.type + '.jpg';
        },

        showLightbox: function () {
            var css = {
                background: 'rgba(0, 0, 0, .75) url("' + this.url() + '")',
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

            var onClick;
            if (this.props.type == 'display') {
                onClick = this.showLightbox;
            }

            return (
                <div className={"gallery-photo gallery-photo-" + this.props.type} onClick={onClick}>
                    <img src={this.url()} style={imgStyle} />
                </div>
            );
        }
    });

    return Photo;
});
