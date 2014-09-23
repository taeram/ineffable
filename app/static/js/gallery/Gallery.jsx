/** @jsx React.DOM */

define('gallery', 
    ['react', 'photo-partition', 'photo', 'lightbox', 'jquery', 'modal', 'underscore', 'gallery-mixin', 'moment'],
    function (React, photoPartition, Photo, Lightbox, $, Modal, _, GalleryMixin, moment ) {

    var Gallery = React.createClass({

        mixins: [GalleryMixin],

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
                loading: true,
                isDeleting: false,
                isManagingPhotos: false
            };
        },

        componentDidMount: function() {
            this.retrieve();
        },

        retrieve: function () {
            var success = function(photos) {
                if (this.isMounted()) {
                    this.setState({
                        photos: JSON.parse(photos),
                        loading: false
                    });
                }
            }.bind(this);

            var error = function () {
                this.setState({
                    loading: false
                });
            }.bind(this);

            this.retrievePhotos(this.props.folder, this.props.modified, success, error);
        },

        /**
         * Show the Lightbox
         *
         * @param DOM photo The photo to display
         */
        onClick: function (photoEl, photoId) {
            React.renderComponent(
                <Lightbox photoId={photoId} photo={photoEl} photos={this.state.photos} folder={this.props.folder} />,
                document.getElementById(Config.App.lightboxElementId)
            );
        },

        showDeleteModal: function () {
            // Unmount the existing component, if any
            React.unmountComponentAtNode(document.getElementById(Config.App.modalElementId));

            React.renderComponent(
                <Modal
                    title={"Delete " + this.props.name + "?"}
                    content={"Are you sure you want to delete the " + this.props.name + " gallery?"}
                    submitButtonText="Delete"
                    submitButtonClass="btn-danger"
                    onClickSubmit={this.deleteGallery} />,
                document.getElementById(Config.App.modalElementId)
            );
        },

        deleteGallery: function () {
            this.setState({
                isDeleting: true
            });

            $.ajax({
                url: '/rest/gallery/' + this.props.id,
                method: 'DELETE',
                success: function() {
                    this.setState({
                        isDeleting: false
                    });

                    this.props.removeGallery(this.props.id);
                }.bind(this)
            });
        },

        toggleManagingPhotos: function () {
            this.setState({
                isManagingPhotos: !this.state.isManagingPhotos
            });
        },

        removePhoto: function (photoId) {
            photos = _.filter(this.state.photos, function (photo) {
                return photo.id != photoId;
            });

            this.setState({
                photos: photos
            })
        },

        render: function() {
            var viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            var photoRowNodes;
            var divCenterStyle = {"text-align": "center"};
            if (this.state.isDeleting) {
                photoRowNodes = (
                    <div style={divCenterStyle} key={"gallery-deleting-" + this.props.id}>
                        <i className="fa fa-spinner fa-spin"></i> Deleting...
                    </div>
                );
            } else if (this.state.loading) {
                photoRowNodes = (
                    <div style={divCenterStyle} key={"gallery-loading-" + this.props.id}>
                        <i className="fa fa-spinner fa-spin"></i>
                    </div>
                );
            } else if (this.state.photos.length > 0) {
                var photoRows = photoPartition(this.state.photos, this.idealRowHeight, viewportWidth, photoPaddingX, photoPaddingY);
                photoRowNodes = _.map(photoRows, function (photoRow, i) {
                    this.photoNodes = _.map(photoRow, function (item) {
                        return (
                            <Photo key={"gallery-" + this.props.id + "-photo-" + item.id}
                                   folder={this.props.folder}
                                   galleryId={this.props.id}
                                   id={item.id}
                                   height={item.height}
                                   name={item.name}
                                   ext={item.ext}
                                   width={item.width}
                                   type="thumb"
                                   removePhoto={this.removePhoto}
                                   isManagingPhotos={this.state.isManagingPhotos}
                                   onClick={this.onClick.bind(this, item)} />
                       );
                    }, this);

                    return (
                        <div key={"gallery-" + this.props.id + "-photos-" + i}>
                            {this.photoNodes}
                        </div>
                    );
                }, this);
            } else {
                photoRowNodes = (
                    <div style={divCenterStyle} key={"gallery-" + this.props.id + "-no-photos-found"}>
                        No Photos Found
                    </div>
                );
            }

            var galleryDate = moment(this.props.created).format('MMMM Do, YYYY');

            var galleryButtonsNode;
            if (Config.User.role != "guest") {
                var managingPhotosButton;
                if (this.state.isManagingPhotos) {
                    var manageBtnStyle = {
                        "margin-left": "15px"
                    };

                    managingPhotosButton = (
                        <button onClick={this.toggleManagingPhotos} className="btn btn-success btn-xs" style={manageBtnStyle}>
                            <i className="fa fa-check"></i> Save Changes
                        </button>
                    );
                }

                galleryButtonsNode = (
                    <span key={"gallery-buttons-" + this.props.id}>
                        <div className="btn-group gallery-heading-buttons">
                            <i className="fa fa-cogs" data-toggle="dropdown"></i>
                            <ul className="dropdown-menu" role="menu">
                                <li>
                                    <a href={"/update/" + this.props.id}>
                                        <i className="fa fa-pencil"></i>
                                        Edit
                                    </a>
                                </li>
                                <li>
                                    <a href={"/upload/" + this.props.id}>
                                        <i className="fa fa-upload"></i>
                                        Upload Photos
                                    </a>
                                </li>
                                <li>
                                    <a href={"/verify/" + this.props.id}>
                                        <i className="fa fa-upload"></i>
                                        Verify Photo Thumbnails
                                    </a>
                                </li>
                                <li>
                                    <a onClick={this.toggleManagingPhotos}>
                                        <i className="fa fa-camera"></i>
                                        Manage Photos
                                    </a>
                                </li>
                                <li>
                                    <a onClick={this.showDeleteModal}>
                                        <i className="fa fa-exclamation text-danger"></i>
                                        <span className="text-danger">
                                            Delete Gallery
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {managingPhotosButton}
                    </span>
                );
            }

            return (
                <div className="gallery">
                    <h2 className="gallery-heading">
                        {this.props.name}

                        <span className="gallery-heading-date">
                            {galleryDate}
                        </span>

                        {galleryButtonsNode}
                    </h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    return Gallery;
});
