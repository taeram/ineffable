/** @jsx React.DOM */

define('lightbox', ['react', 'handle-resize-mixin'], function(React, HandleResizeMixin) {

    var Lightbox = React.createClass({

        mixins: [HandleResizeMixin],

        /**
         * How long to show an image
         *
         * @var integer
         */
        slideshowInterval: 5,

        getInitialState: function() {
            // Find the index of the selected photo in this.props.photos
            var selectedIndex = 0;
            for (var i in this.props.photos) {
                var photo = this.props.photos[i];
                if (photo.id == this.props.photo.id) {
                    selectedIndex = parseInt(i, 10);
                    break;
                }
            }

            return {
                index: selectedIndex,
                isLoaded: false,
                slideshow: false
            };
        },

        close: function () {
            React.unmountComponentAtNode(
                document.getElementById(Config.App.lightboxElementId)
            );
        },

        next: function (e) {
            if (e) {
                e.stopPropagation();
            }

            if (this.state.index + 1 < this.props.photos.length) {
                this.setState({
                    index: this.state.index + 1,
                    isLoaded: false
                });
            } else {
                this.slideshow();
            }
        },

        prev: function (e) {
            e.stopPropagation();
            if (this.state.index - 1 >= 0) {
                this.setState({
                    index: this.state.index - 1,
                    isLoaded: false
                });
            }
        },

        isImageLoaded: function () {
            this.setState({isLoaded: true});
        },

        download: function (e) {
            e.stopPropagation();
        },

        slideshow: function (e) {
            if (e) {
                e.stopPropagation();
            }

            if (this.state.slideshow) {
                clearTimeout(this.slideshowTimer);
                this.setState({
                    index: 0,
                    slideshow: false
                });
            } else {
                this.slideshowTimer = setInterval(this.next, (this.slideshowInterval * 1000));
                this.setState({slideshow: true});
            }
        },

        render: function() {
            var style = {
                lineHeight: window.innerHeight + 'px'
            };

            var photo = this.props.photos[this.state.index];
            var photoUrl = photo.url('display');

            var photoNode = null;
            if (!this.state.isLoaded) {
                var img = new Image() ;
                img.src = photoUrl;
                img.onload = this.isImageLoaded;

                photoNode = (
                    <div className="lightbox-spinner" ref="spinner">
                        <i className="fa fa-spinner fa-spin"></i>
                    </div>
                );
            } else {
                photoNode = (
                    <img className="lightbox-photo" src={photoUrl} />
                );
            }

            var slideshowBtnClass = React.addons.classSet({
                'btn': true,
                'btn-xs': true,
                'btn-success': this.state.slideshow,
                'btn-default': !this.state.slideshow
            });

            return (
                <div className="lightbox" style={style} onClick={this.close}>
                    <div className="lightbox-buttons">
                        <a className="btn btn-default btn-xs" href={photo.url('original')} onClick={this.download}>
                            <i className="fa fa-download"></i>
                            Download
                        </a>
                        <button className={slideshowBtnClass} onClick={this.slideshow}>
                            <i className="fa fa-picture-o"></i>
                            {this.state.slideshow ? 'Stop' : 'Start'} Slideshow
                        </button>
                    </div>

                    <span className="lightbox-nav lightbox-nav-left" onClick={this.prev}>
                        <i className="fa fa-chevron-left"></i>
                    </span>
                    {photoNode}
                    <span className="lightbox-nav lightbox-nav-right" onClick={this.next}>
                        <i className="fa fa-chevron-right"></i>
                    </span>
                </div>
            );
        }
    });

    return Lightbox;
});
