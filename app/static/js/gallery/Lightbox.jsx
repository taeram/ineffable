/** @jsx React.DOM */

define('lightbox', ['react', 'handle-resize-mixin', 'photo-mixin', 'mousetrap'], function(React, HandleResizeMixin, PhotoMixin, Mousetrap) {

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
                slideshow: false,
                video: {
                    width: false,
                    height: false
                }
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
                    isLoaded: false,
                    video: {
                        width: false,
                        height: false
                    }
                });
            }
        },

        prev: function (e) {
            e.stopPropagation();
            if (this.state.index - 1 >= 0) {
                this.setState({
                    index: this.state.index - 1,
                    isLoaded: false,
                    video: {
                        width: false,
                        height: false
                    }
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

        setVideoDimensions: function () {
            // Add an explicit width and height to videos after they've loaded, so they appear properly centered
            var photo = this.props.photos[this.state.index];
            var photoDisplayUrl = this.photoUrl('display', photo.ext, this.props.folder, photo.name);
            if (photoDisplayUrl.match(/\.webm$/)) {
                $('video').on('loadeddata', function () {
                    this.setState({
                        video: {
                            width: $('video').width(),
                            height: $('video').height()
                        }
                    });
                }.bind(this));
            }
        },

        componentDidUpdate: function () {
            this.setVideoDimensions();
        },

        componentDidMount: function () {
            Mousetrap.bind('right', this.next.bind(this));
            Mousetrap.bind('left', this.prev.bind(this));

            this.setVideoDimensions();
        },

        render: function() {
            var style = {
                lineHeight: window.innerHeight + 'px'
            };

            var photo = this.props.photos[this.state.index];
            var photoThumbUrl = this.photoUrl('thumb', photo.ext, this.props.folder, photo.name);
            var photoDisplayUrl = this.photoUrl('display', photo.ext, this.props.folder, photo.name);
            var photoOriginalUrl = this.photoUrl('original', photo.ext, this.props.folder, photo.name);

            var photoNode = null;
            if (photoDisplayUrl.match(/\.webm$/)) {
                photoNode = (
                    <div className="lightbox-video" key={"photo-" + this.state.index} style={{width: (this.state.video.width || "auto"), height: (this.state.video.height || "auto") }}>
                        <video poster={photoThumbUrl} ref="video" preload="auto" autoPlay="autoplay" muted="muted" loop="loop">
                            <source src={photoDisplayUrl} type="video/webm" />
                        </video>
                    </div>
                );
            } else if (!this.state.isLoaded) {
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
