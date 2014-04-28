/** @jsx React.DOM */

define('photo', ['react'], function(React) {

    var Photo = React.createClass({
        url: function (type) {
            var ext = 'jpg';
            if (type == 'original') {
                postfix = '';
            } else {
                postfix = '_' + type;
            }

            // If it's a .gif, don't use the _display.jpg, use the original .gif
            if (type == 'display' && this.props.ext == 'gif') {
                postfix = '';
                ext = 'gif';
            }

            return 'https://' + Config.s3_bucket + '.s3.amazonaws.com' + '/' + this.props.folder + '/' + this.props.name + postfix + '.' + ext;
        },

        onClick: function () {
            this.props.onClick(this);
        },

        render: function() {
            var imgStyle = {
                width: this.props.width,
                height: this.props.height
            };

            return (
                <div className="gallery-photo" onClick={this.onClick} >
                    <img src={this.url('thumb')} style={imgStyle} />
                </div>
            );
        }
    });

    return Photo;
});
