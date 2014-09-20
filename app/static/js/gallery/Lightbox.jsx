/** @jsx React.DOM */

define('lightbox', ['react', 'handle-resize-mixin', 'photo-mixin'], function(React, HandleResizeMixin, PhotoMixin) {

    var Lightbox = React.createClass({

        mixins: [HandleResizeMixin, PhotoMixin],

        /**
         * How long to show an image
         *
         * @var integer
         */
        slideshowInterval: 5,

        getInitialState: function() {
            return {
                index: _.indexOf(this.props.photos, this.props.photo),
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
            var photoDisplayUrl = this.photoUrl('display', photo.ext, this.props.folder, photo.name);
            var photoOriginalUrl = this.photoUrl('original', photo.ext, this.props.folder, photo.name);

            var photoNode = null;
            if (!this.state.isLoaded) {
                var img = new Image() ;
                img.src = photoDisplayUrl;
                img.onload = this.isImageLoaded;

                photoNode = (
                    <div className="lightbox-spinner" ref="spinner">
                        <i className="fa fa-spinner fa-spin"></i>
                    </div>
                );
            } else {
                photoNode = (
                    <img className="lightbox-photo" src={photoDisplayUrl} />
                );
            }

            var slideshowBtnClass = React.addons.classSet({
                'btn': true,
                'btn-xs': true,
                'btn-success': this.state.slideshow,
                'btn-default': !this.state.slideshow
            });

            var prevBtnClass = React.addons.classSet({
                'lightbox-nav': true,
                'lightbox-nav-left': true,
                'hidden': (this.state.index === 0)
            });

            var nextBtnClass = React.addons.classSet({
                'lightbox-nav': true,
                'lightbox-nav-right': true,
                'hidden': (this.state.index == this.props.photos.length - 1)
            });

            return (
                <div className="lightbox" style={style} onClick={this.close}>
                    <div className="lightbox-buttons">
                        <a className="btn btn-default btn-xs" href={photoOriginalUrl} onClick={this.download}>
                            <i className="fa fa-download"></i>
                            Download
                        </a>
                        <button className={slideshowBtnClass} onClick={this.slideshow}>
                            <i className="fa fa-picture-o"></i>
                            {this.state.slideshow ? 'Stop' : 'Start'} Slideshow
                        </button>
                    </div>

                    <span className={prevBtnClass} onClick={this.prev}>
                        <i className="fa fa-chevron-left"></i>
                    </span>
                    {photoNode}
                    <span className={nextBtnClass} onClick={this.next}>
                        <i className="fa fa-chevron-right"></i>
                    </span>
                </div>
            );
        }
    });

    return Lightbox;
});
