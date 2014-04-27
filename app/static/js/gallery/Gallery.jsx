/** @jsx React.DOM */

define('gallery', ['react', 'photo-partition', 'photo', 'lightbox'], function(React, photoPartition, Photo, Lightbox) {

    var Gallery = React.createClass({

        /**
         * The ideal row height
         *
         * @var integer
         */
        idealRowHeight: 100,

        /**
         * A list of all photo elements
         *
         * @var DOM
         */
        photos: null,

        getInitialState: function() {
            return {
                photos: [],
                loading: true
            };
        },

        componentWillMount: function() {
            $.ajax({
                url: 'https://' + Config.s3_bucket + '.s3.amazonaws.com/' + this.props.folder + '/photos.json',
                success: function(photos) {
                    this.setState({
                        photos: JSON.parse(photos),
                        loading: false
                    });
                }.bind(this),
                error: function () {
                    this.setState({
                        loading: false
                    });

                    console.log("No photos found for gallery " + this.props.id);
                }.bind(this)
            });
        },

        /**
         * Show the Lightbox
         *
         * @param DOM photo The photo to display
         */
        onClick: function (photo) {
            React.renderComponent(
                <Lightbox photo={photo} photos={this.photoNodes} />,
                document.getElementById(Config.App.lightboxElementId)
            );
        },

        render: function() {
            var viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            var photoRowNodes;
            if (this.state.loading) {
                var divStyle = {"text-align": "center"};
                photoRowNodes = (
                    <div style={divStyle}>
                        <i class="fa fa-spinner fa-spin"></i>
                    </div>
                );
            } else if (this.state.photos.length > 0) {
                var photoRows = photoPartition(this.state.photos, this.idealRowHeight, viewportWidth, photoPaddingX, photoPaddingY);
                photoRowNodes = _.map(photoRows, function (photoRow) {
                    this.photoNodes = _.map(photoRow, function (item) {
                        return (
                            <Photo folder={this.props.folder}
                                   height={item.height}
                                   name={item.name}
                                   width={item.width}
                                   type="thumb"
                                   onClick={this.onClick} />
                       );
                    }, this);

                    return (
                        <div>
                            {this.photoNodes}
                        </div>
                    );
                }, this);
            } else {
                var divCenterStyle = {"text-align": "center"};
                photoRowNodes = (
                    <div style={divCenterStyle}>
                        No Photos Found
                    </div>
                );
            }

            var galleryDate = moment(this.props.created).format('MMMM Do, YYYY');

            return (
                <div className="gallery">
                    <h2 className="gallery-heading">
                        {this.props.name}

                        <span className="gallery-heading-date">
                            {galleryDate}
                        </span>

                        <div className="btn-group gallery-heading-buttons">
                            <i className="fa fa-cogs" data-toggle="dropdown"></i>
                            <ul className="dropdown-menu" role="menu">
                                <li>
                                    <a href={"/update/" + this.props.id}>
                                        <i class="fa fa-pencil"></i>
                                        Edit
                                    </a>
                                </li>
                                <li>
                                    <a href={"/upload/" + this.props.id}>
                                        <i class="fa fa-upload"></i>
                                        Upload Photos
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    return Gallery;
});
