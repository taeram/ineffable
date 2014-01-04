/** @jsx React.DOM */

define('gallery',
[
    "jquery",
    "react",
    "linear-partition",
    "underscore"
], function(
    $,
    React,
    linear_partition,
    _
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
            var viewportWidth = this.props.viewportWidth;
            var windowHeight = this.props.windowHeight;
            var galleryNodes = this.state.data.map(function (gallery) {
                return <Gallery
                            folder={gallery.folder}
                            name={gallery.name}
                            photos={gallery.photos}
                            viewportWidth={viewportWidth}
                            windowHeight={windowHeight} />;
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
            var partitionedPhotos = photoPartition(
                this.props.photos,
                this.props.viewportWidth,
                this.props.windowHeight
            );
            var photoRowNodes = _.map(partitionedPhotos, function (photos) {
                return <PhotoRow folder={folder} photos={photos} />;
            });

            return (
                <div className="img-gallery">
                    <h2>{this.props.name}</h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    var PhotoRow = React.createClass({
        render: function () {
            var folder = this.props.folder;
            var photoNodes = _.map(this.props.photos, function (photo) {
                return <Photo
                            folder={folder}
                            height={photo.height}
                            name={photo.name}
                            width={photo.width} />;
            });

            return (
                <div className="img-row">
                    {photoNodes}
                </div>
            );
        }
    });

    var Photo = React.createClass({
        baseUrl: 'https://' + Config.s3_bucket + '.s3.amazonaws.com',

        thumbUrl: function () {
            return this.baseUrl + '/' + this.props.folder + '/' + this.props.name + '_display.jpg';
        },

        render: function() {
            var imgStyle = {
                width: this.props.width,
                height: this.props.height
            };

            return (
                <div className="img-photo">
                    <img src={this.thumbUrl()} style={imgStyle} className="foo" />
                </div>
            );
        }
    });

    /**
     * Ideal photo distribution
     *
     * Retrieved on 2013-08-13 from http://www.crispymtn.com/stories/the-algorithm-for-a-perfectly-balanced-photo-gallery
     * Modified for use in ineffable by Jesse Patching
     *
     * @param array photos The photos
     * @param integer viewportWidth The DOM viewport width, in pixels
     * @param integer windowHeight The DOM window height, in pixels
     */
    var photoPartition = function (photos, viewportWidth, windowHeight) {
        var idealHeight, index, partition, rowBuffer, rows, summedWidth, weights;
        idealHeight = parseInt(windowHeight / 5, 10);
        summedWidth = _.reduce(photos, function(sum, photo) {
            return sum += photo.aspect_ratio * idealHeight;
        }, 0);

        rows = Math.round(summedWidth / viewportWidth);
        if (rows < 1) {
            // (2a) Fallback to just standard size
            return _.map(photos, function(photo) {
                photo.width = parseInt(idealHeight * photo.aspect_ratio, 10) - 1;
                photo.height = idealHeight - 1;
                return photo;
            });
        } else {
            // (2b) Distribute photos over rows using the aspect ratio as weight
            weights = _.map(photos, function(photo) {
                return parseInt(photo.aspect_ratio * 100, 10);
            });
            partition = linear_partition(weights, rows);

            // (3) Iterate through partition
            index = 0;
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
                    photo.width = parseInt(viewportWidth / summedRatios * photo.aspect_ratio, 10) - 1;
                    photo.height = parseInt(viewportWidth / summedRatios, 10) - 1;

                    return photo;
                });
            });
        }
    }

    return GalleryList;
});
