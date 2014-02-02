/** @jsx React.DOM */

define('photo', ['react'], function(React) {

    var Photo = React.createClass({
        url: function (type) {
            if (type == 'original') {
                postfix = '';
            } else {
                postfix = '_' + type;
            }

            return 'https://' + Config.s3_bucket + '.s3.amazonaws.com' + '/' + this.props.folder + '/' + this.props.name + postfix + '.jpg';
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
