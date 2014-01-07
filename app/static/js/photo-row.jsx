/** @jsx React.DOM */

define('photo-row',
[
    "react",
    "underscore"
], function(
    React,
    _
) {
    var PhotoRow = React.createClass({
        render: function () {
            var folder = this.props.folder;
            var photoType = this.props.type;
            var onClickEnabled = this.props.onClickEnabled;
            var photoNodes = _.map(this.props.photos, function (photo) {
                return <Photo
                            folder={folder}
                            height={photo.height}
                            name={photo.name}
                            onClickEnabled={onClickEnabled}
                            type={photoType}
                            width={photo.width} />;
            });

            return (
                <div className="gallery-row">
                    {photoNodes}
                </div>
            );
        }
    });

    var Photo = React.createClass({
        baseUrl: 'https://' + Config.s3_bucket + '.s3.amazonaws.com',

        thumbUrl: function () {
            return this.baseUrl + '/' + this.props.folder + '/' + this.props.name + '_thumb.jpg';
        },

        displayUrl: function() {
            return this.baseUrl + '/' + this.props.folder + '/' + this.props.name + '_display.jpg';
        },

        onClick: function () {
            if (this.props.onClickEnabled === false) {
                return ''
            }

            var css = {
                background: 'rgba(0, 0, 0, .75) url("' + this.displayUrl() + '")',
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

            if (this.props.type == 'thumb') {
                src = this.thumbUrl()
            } else if (this.props.type == 'display') {
                src = this.thumbUrl()
            }

            var photoClass = "gallery-photo gallery-photo-" + this.props.type;

            return (
                <div className={photoClass} onClick={this.onClick}>
                    <img src={src} style={imgStyle} />
                </div>
            );
        }
    });

    return PhotoRow;
});
