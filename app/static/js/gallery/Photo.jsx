/** @jsx React.DOM */

define('photo', ['react', 'modal'], function(React, Modal) {

    var Photo = React.createClass({

        getInitialState: function() {
            return {
                isDeleting: false
            };
        },

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

        showDeleteModal: function () {
            // Unmount the existing component, if any
            React.unmountComponentAtNode(document.getElementById(Config.App.modalElementId));

            var modalContentNode = (
                <div>
                    Are you sure you want to delete this photo?
                    <img src={this.url('thumb')} style={{padding: "10px"}} />
                </div>
            );

            React.renderComponent(
                <Modal
                    title={"Delete Photo?"}
                    content={modalContentNode}
                    submitButtonText="Delete"
                    submitButtonClass="btn-danger"
                    onClickSubmit={this.deletePhoto} />,
                document.getElementById(Config.App.modalElementId)
            );
        },

        deletePhoto: function () {
            this.setState({
                isDeleting: true
            });

            $.ajax({
                url: '/rest/photo/' + this.props.galleryId + '/' + this.props.id,
                method: 'DELETE',
                success: function() {
                    this.setState({
                        isDeleting: false
                    });
                    this.props.removePhoto(this.props.id)
                }.bind(this)
            });
        },

        render: function() {
            var imgStyle = {
                width: this.props.width,
                height: this.props.height
            };

            var managePhotosNode;
            if (this.state.isDeleting) {
                managePhotosNode = (
                    <div className="btn-group gallery-photo-manage-dropdown">
                        <button className="btn btn-default btn-xs" disabled>
                            <i className="fa fa-spinner fa-spin"></i>
                        </button>
                    </div>
                );
            } else if (this.props.isManagingPhotos) {
                managePhotosNode = (
                    <div className="btn-group gallery-photo-manage-dropdown">
                        <button className="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown">
                            <i className="fa fa-cog"></i>
                        </button>
                        <ul className="dropdown-menu" role="menu">
                            <li>
                                <a onClick={this.showDeleteModal} href="#">
                                    <i className="fa fa-exclamation text-danger"></i>
                                    <span className="text-danger">
                                        Delete
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                );
            }

            return (
                <div className="gallery-photo">
                    {managePhotosNode}
                    <img onClick={this.props.onClick} src={this.url('thumb')} style={imgStyle} />
                </div>
            );
        }
    });

    return Photo;
});
