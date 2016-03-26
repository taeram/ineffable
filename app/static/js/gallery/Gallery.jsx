/** @jsx React.DOM */

define('gallery',
    ['react', 'photo-partition', 'photo', 'lightbox', 'jquery', 'modal', 'underscore', 'moment'],
    function (React, photoPartition, Photo, Lightbox, $, Modal, _, moment ) {

    var Gallery = React.createClass({

        /**
         * The ideal row height
         *
         * @var integer
         */
        idealRowHeight: 100,

        getInitialState: function() {
            return {
                photos: this.props.photos,
                isDeleting: false,
                isManagingPhotos: false
            };
        },

        /**
         * Show the Lightbox
         *
         * @param DOM photo The photo to display
         */
        onClick: function (photoEl, photoId) {
            React.render(
                <Lightbox photoId={photoId} photo={photoEl} photos={this.state.photos} folder={this.props.folder} />,
                document.getElementById(Config.App.lightboxElementId)
            );
        },

        showDeleteModal: function () {
            // Unmount the existing component, if any
            React.unmountComponentAtNode(document.getElementById(Config.App.modalElementId));

            React.render(
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

        showShareModal: function () {
            // Unmount the existing component, if any
            React.unmountComponentAtNode(document.getElementById(Config.App.modalElementId));

            var onShow = function () {
                $('#share-album').select();
            }

            React.render(
                <Modal
                    title={"Share " + this.props.name}
                    content={'<div class="text-center">Share this album:<br /><input id="share-album" class="form-control" type="text" value="' + window.location.origin + '/s/' + this.props.share_code + '"></div>'}
                    onShow={onShow}
                    showSubmitButton={false} />,
                document.getElementById(Config.App.modalElementId)
            );
        },

        render: function() {
            var viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            var photoRowNodes;
            var divCenterStyle = {"textAlign": "center"};
            if (this.state.isDeleting) {
                photoRowNodes = (
                    <div style={divCenterStyle} key={"gallery-deleting-" + this.props.id}>
                        <i className="fa fa-spinner fa-spin"></i> Deleting...
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
            if (!this.props.isShared && Config.User.role != "guest") {
                var managingPhotosButton;
                if (this.state.isManagingPhotos) {
                    var manageBtnStyle = {
                        "marginLeft": "15px"
                    };

                    managingPhotosButton = (
                        <button onClick={this.toggleManagingPhotos} className="btn btn-success btn-xs" style={manageBtnStyle}>
                            <i className="fa fa-check"></i> Finished Editing Photos
                        </button>
                    );
                }

                galleryButtonsNode = (
                    <span key={"gallery-buttons-" + this.props.id}>
                        <div className="btn-group gallery-heading-buttons">
                            <button className="btn btn-default btn-mini btn-dropdown" data-toggle="dropdown">
                                <i className="fa fa-cogs"></i>
                            </button>
                            <ul className="dropdown-menu" role="menu">
                                <li>
                                    <a onClick={this.showShareModal}>
                                        <i className="fa fa-share"></i>
                                        Share this Album
                                    </a>
                                </li>
                                <li>
                                    <a href={"/update/" + this.props.id}>
                                        <i className="fa fa-pencil"></i>
                                        Edit Album
                                    </a>
                                </li>
                                <li>
                                    <a onClick={this.toggleManagingPhotos}>
                                        <i className="fa fa-camera"></i>
                                        Edit Photos
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
                                        Verify Thumbnails
                                    </a>
                                </li>
                                <li>
                                    <a onClick={this.showDeleteModal}>
                                        <span className="text-danger">
                                            <i className="fa fa-exclamation"></i>
                                            Delete this Album
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
