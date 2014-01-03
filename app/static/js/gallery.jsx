/** @jsx React.DOM */

define('gallery',
[
    "jquery",
    "react",
    "linear-partition"
], function(
    $,
    React,
    linear_partition
) {

    var GalleryList = React.createClass({
        getInitialState: function() {
            return {data: []};
        },

        componentWillMount: function() {
            $.ajax({
                url: this.props.url,
                success: function(data) {
                    this.setState({data: data});
                }.bind(this)
            });
        },

        render: function() {
            var galleryNodes = this.state.data.map(function (gallery) {
                return <Gallery name={gallery.name} folder={gallery.folder} photos={gallery.photos} />;
            });

            return (
                <div className="gallery-list">
                    {galleryNodes}
                </div>
            );
        }
    });

    var Gallery = React.createClass({
        render: function() {
            var folder = this.props.folder;
            var photoNodes = this.props.photos.map(function (photo) {
                return <Photo folder={folder} name={photo.name} />;
            });

            return (
                <div className="img-gallery">
                    <h2>{this.props.name}</h2>
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

        render: function() {
            return (
                <div className="img-photo">
                    <img src={this.thumbUrl()} />
                </div>
            );
        }
    });

    return GalleryList;
});
