/** @jsx React.DOM */

define('gallery', ['react', 'photo-partition', 'photo', 'history'], function(React, photoPartition, Photo, History) {

    var Gallery = React.createClass({

        getInitialState: function() {
            state = {
                isExpanded: null,
                type: null,
                isBookmarked: this.isBookmarked()
            }

            if (this.isBookmarked()) {
                state.isExpanded = true;
                state.type = "display";
            } else {
                state.isExpanded = false;
                state.type = "thumb";
            }

            return state;
        },

        /**
         * Has the user visited the url of the individual album?
         *
         * @return boolean
         */
        isBookmarked: function () {
            return window.location.pathname == '/' + this.getSlug();
        },

        getSlug: function () {
            name = this.props.name.toLowerCase();
            name = name.replace(/[^a-z0-9]/ig, '-').replace(/--/, '-');
            return this.props.id + '-' + name;
        },

        onClick: function () {
            // toggle expanded/collapsed
            if (this.state.isExpanded === false) {
                this.state.isExpanded = true;
                this.state.type = 'display';

                // Navigate to the album, and update the url
                History.pushState({gallery: this.props.id}, this.props.name + " - Gallery", this.getSlug());
            } else {
                this.state.isExpanded = false;
                this.state.type = 'thumb';

                // Navigate to the album, and update the url
                History.replaceState({}, 'Gallery', null);
            }

            this.setState(this.state);
        },

        getRowHeight: function () {
            if (this.state.type == 'thumb') {
                return $(window).height() / 8;
            } else {
                return $(window).height() / 3;
            }
        },

        render: function() {
            var idealHeight = this.getRowHeight(),
                viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            var photoRows = photoPartition(this.props.photos, idealHeight, viewportWidth, photoPaddingX, photoPaddingY);
            if (this.state.isExpanded === false) {
                photoRows = photoRows.slice(0, 1);
            }

            var photoRowNodes = _.map(photoRows, function (photoRow) {
                var photoNodes = _.map(photoRow, function (photo) {
                    return <Photo
                                folder={this.props.folder}
                                height={photo.height}
                                name={photo.name}
                                width={photo.width}
                                type={this.state.type} />;
                }, this);

                return (
                    <div>
                        {photoNodes}
                    </div>
                );
            }, this);

            return (
                <div>
                    <h2 id={this.getSlug()} className="gallery-heading" onClick={this.onClick}>
                        <button className="btn"><i className={"fa fa-" + (this.state.isExpanded ? 'minus' : 'plus')}></i></button>
                        {this.props.name}
                    </h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    return Gallery;
});
