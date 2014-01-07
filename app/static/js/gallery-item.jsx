/** @jsx React.DOM */

define('gallery-item',
[
    "jquery",
    "react",
    "photo-row",
    "photo-partition"
], function(
    $,
    React,
    PhotoRow,
    photoPartition
) {

    var GalleryItem = React.createClass({
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
            var photoPaddingX = this.props.photoPaddingX;
            var photoPaddingY = this.props.photoPaddingY;

            return (
                <div className="gallery-item">
                    <Gallery
                        folder={this.state.data.folder}
                        id={this.state.data.id}
                        name={this.state.data.name}
                        photoPaddingX={photoPaddingX}
                        photoPaddingY={photoPaddingY}
                        photos={this.state.data.photos}
                        photoType='display'
                        viewportWidth={viewportWidth}
                        windowHeight={windowHeight} />
                </div>
            );
        }
    });

    var Gallery = React.createClass({
        render: function() {
            var folder = this.props.folder;
            var photoType = this.props.photoType;
            var partitionedPhotos = photoPartition(
                this.props.photos,
                this.props.photoPaddingX,
                this.props.photoPaddingY,
                this.props.photoType,
                this.props.viewportWidth,
                this.props.windowHeight
            );

            var photoRowNodes = _.map(partitionedPhotos, function (photos) {
                return <PhotoRow onClickEnabled={true} folder={folder} photos={photos} type={photoType} />;
            });

            return (
                <div className="gallery">
                    <h2 className="gallery-heading">{this.props.name}</h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    return GalleryItem;
});
