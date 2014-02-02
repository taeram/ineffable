/** @jsx React.DOM */

define('gallery', ['react', 'photo-partition', 'photo', 'history'], function(React, photoPartition, Photo, History) {

    var Gallery = React.createClass({

        /**
         * The ideal row height
         *
         * @var integer
         */
        idealRowHeight: 100,

        render: function() {
            var viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            var photoRows = photoPartition(this.props.photos, this.idealRowHeight, viewportWidth, photoPaddingX, photoPaddingY);
            var photoRowNodes = _.map(photoRows, function (photoRow) {
                var photoNodes = _.map(photoRow, function (photo) {
                    return <Photo
                                folder={this.props.folder}
                                height={photo.height}
                                name={photo.name}
                                width={photo.width}
                                type="thumb" />;
                }, this);

                return (
                    <div>
                        {photoNodes}
                    </div>
                );
            }, this);

            var h2Classes = React.addons.classSet({
                "gallery-heading": true
            });

            return (
                <div className="gallery">
                    <h2 className={h2Classes}>
                        {this.props.name}
                    </h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    return Gallery;
});
