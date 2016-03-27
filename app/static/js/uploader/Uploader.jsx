define('uploader',
    ["react", "classnames", "jquery", "number_format", "underscore", "s3-uploader", "jquery-serialize-object", "jpegmeta"],
    function (React, classnames, $, number_format, _, S3Uploader, noop1, noop2) {

    var Uploader = React.createClass({

        getInitialState: function() {
            return {
                files: []
            };
        },

        componentDidMount: function () {
            // Warn if user tries to navigate away while files are uploading
            $(window).on("beforeunload", this.onUnload);

            // On the Add Files button make sure the <input /> is the same size as the <button>
            var inputFile = $('.input-file');
            $(inputFile).css({
                height: $(inputFile).parent().css('height'),
                width: $(inputFile).parent().css('width'),
                marginTop: '-' + $(inputFile).parent().css('paddingTop'),
                marginLeft: '-' + $(inputFile).parent().css('paddingLeft')
            });
        },

        onUnload: function () {
            if (this.state.files.length > 0 && this.getUploadProgressPercent() > 0 && this.getUploadProgressPercent() < 100) {
                return "There are still files uploading.";
            }
        },

        /**
         * Get the total number of bytes to upload
         *
         * @return integer
         */
        getBytesTotal: function () {
            var bytesTotal = 0;
            for (var i=0; i < this.state.files.length; i++) {
                if (this.state.files[i].isTooBig) {
                    continue;
                }

                bytesTotal += this.state.files[i].size;
            }

            return bytesTotal;
        },

        /**
         * Get the total number of bytes uploaded
         *
         * @return integer
         */
        getBytesUploaded: function () {
            var bytesUploaded = 0;
            for (var i=0; i < this.state.files.length; i++) {
                if (this.state.files[i].bytesUploaded !== undefined) {
                    bytesUploaded += this.state.files[i].bytesUploaded;
                }
            }

            return bytesUploaded;
        },

        /**
         * Return the upload progress as a percentage
         *
         * @return integer
         */
        getUploadProgressPercent: function () {
            var bytesTotal = this.getBytesTotal();
            var bytesUploaded = this.getBytesUploaded();

            return (bytesUploaded / bytesTotal) * 100;
        },

        /**
         * Get the number of files left to upload
         *
         * @return integer
         */
        getUploadQueueSize: function () {
            return _.filter(this.state.files, function (file) {
                return !file.isUploaded && !file.isUploadError && !file.isTooBig;
            }).length;
        },

        onClickAddFiles: function (element) {
            if (this.getUploadProgressPercent() > 0) {
                // Clear previously uploaded files
                this.setState({files: []});
            }

            // Add the files to the list
            var newFiles = $(element.target).context.files;
            for (var i=0; i < newFiles.length; i++) {
                var file = newFiles[i];

                if (file.size > Config.max_upload_size) {
                    file.isTooBig = true;
                } else {
                    file.isTooBig = false;
                }
                file.progress = 0;
                file.isUploaded = false;
                file.isUploadError = false;
                file.remoteUrl = null;
                file.thumbnailUrl = null;
                file.dateCreated = null;

                // Get the EXIF information for this file
                var fileReader = new FileReader();
                fileReader.onloadend = function (file, e) {
                    var result = e.currentTarget.result;
                    try {
                        var meta = new JpegMeta.JpegFile(result, file.name);
                        file.dateCreated = meta.exif.DateTimeOriginal.value;
                    } catch (exception) {
                        // console.log("No EXIF info found in: " + file.name);
                    }
                }.bind(this, file)
                fileReader.readAsBinaryString(file);

                // Get the width, height and aspect ratio of the image
                var image = new Image();
                image.onload = function(file, e) {
                    var img = e.path[0];
                    file.width = img.width;
                    file.height = img.height;
                    file.aspect_ratio = (img.width / img.height);
                }.bind(this, file);
                image.onerror = function(file, e) {
                    file.width = null;
                    file.height = null;
                    file.aspect_ratio = null;
                }.bind(this, file);
                var url = window.URL || window.webkitURL;
                image.src = url.createObjectURL(file);

                this.state.files.push(file);
            }

            // Ensure there are no duplicate file names
            this.state.files = _.uniq(this.state.files, false, function (file) {
                return file.name;
            });

            this.setState({files: this.state.files});
        },

        onClickStartUpload: function (e) {
            e.preventDefault();

            // Get the form data as a key => value array
            var formObject = $('.form-upload').serializeObject();
            var formUrl = $('.form-upload').attr('action');
            var formMethod = $('.form-upload').attr('method');

            for (var i=0; i < this.state.files.length; i++) {
                var file = this.state.files[i];

                // Don't upload the same file twice
                if (file.isUploaded === true) {
                    continue;
                }

                // Don't upload files which exceed the max upload size
                if (file.isTooBig === true) {
                    continue;
                }

                var u = new S3Uploader(file, formObject, formUrl, formMethod, this.onFileUploadProgress, this.onFileUploadComplete);
                u.send();
            }
        },

        onClickCancelUpload: function () {
            // Abort any pending uploads
            for (var i=0; i < this.state.files.length; i++) {
                if (this.state.files[i].xhr !== undefined) {
                    this.state.files[i].xhr.abort();
                }
            }

            this.setState({files: []});
        },

        onClickRemoveFile: function (file) {
            // Abort the file upload, if it's in progress
            if (file.xhr !== undefined) {
                file.xhr.abort();
            }

            var files = _.without(this.state.files, file);
            this.setState({files: files});
        },

        onFileUploadComplete: function (file, isSuccess, s3folder, remoteUrl) {
            // Update the file object
            file.isUploaded = isSuccess;
            file.isUploadError = !isSuccess;
            file.remoteUrl = remoteUrl;
            file.folder = s3folder;

            // Set the file object back in the state
            var i = _.find(this.state.files, function (f) {
                return f.name == file.name;
            })
            var files = this.state.files;
            files[i] = file;
            this.setState({files: files});

            // POST the file information to the backend
            var matches = file.name.match(/^(.+?)\.([a-z]*)/i, '');
            var fileName = matches[1];
            var fileExt = matches[2];
            var data = {
                name: fileName,
                ext: fileExt,
                aspect_ratio: file.aspect_ratio,
                gallery_id: Config.gallery_id,
                created: file.dateCreated
            };

            $.post('/rest/photo/', data);
        },

        onFileUploadProgress: function (file, bytesLoaded) {
            file.bytesUploaded = bytesLoaded;
            file.progress = Math.round((bytesLoaded / file.size) * 100);

            var i = _.find(this.state.files, function (f) {
                return f.name == file.name;
            })
            var files = this.state.files;
            files[i] = file;
            this.setState({files: files});
        },

        render: function() {
            var uploadProgressBar;
            if (this.getUploadProgressPercent() > 0) {
                var uploadProgressBarClass = classnames({
                    'progress-bar': true,
                    'progress-bar-success': this.getUploadQueueSize() == 0
                });
                uploadProgressBar = (
                    <div className="progress progress-striped">
                        <div className={ uploadProgressBarClass } style={{ width: this.getUploadProgressPercent() + "%" }} ></div>
                    </div>
                );
            }

            var filesTable;
            if (this.state.files.length > 0) {
                var fileNodes = this.state.files.map(function(file) {
                    var fileName;
                    if (file.isUploaded) {
                        var thumbnailNode;
                        if (file.thumbnailUrl) {
                            thumbnailNode = (
                                <span style={{ paddingRight: "5px" }}>
                                    <img className="img-thumbnail" src={file.thumbnailUrl}/>
                                </span>
                            );
                        }

                        fileName = (
                            <span>
                                { thumbnailNode }
                                <a href={file.remoteUrl} target="_blank">{ file.name }</a>
                            </span>
                        );
                    } else {
                        fileName = (
                            <span>{ file.name }</span>
                        );
                    }

                    var fileProgressBarClass = classnames({
                        'progress-bar': true,
                        'progress-bar-info': !file.isUploaded && !file.isUploadError,
                        'progress-bar-success': file.isUploaded && !file.isUploadError,
                        'progress-bar-danger': file.isUploadError
                    });

                    var fileSize;
                    if (file.isTooBig) {
                        fileSize = (
                            <span data-toggle="tooltip" className="text-danger">File too large</span>
                        );
                    } else {
                        fileSize = (
                            <span>{ number_format(file.size) }</span>
                        );
                    }

                    return (
                        <tr key={ file.name }>
                            <td style={{ whiteSpace: "nowrap" }}>
                                { fileName }
                            </td>
                            <td>
                                <div className="progress progress-striped">
                                    <div style={{ width: file.progress + "%"}} className={ fileProgressBarClass }></div>
                                </div>
                            </td>
                            <td>
                                { fileSize }
                            </td>
                            <td>
                                <button disabled={ file.isUploaded } type="button" onClick={ this.onClickRemoveFile.bind(this, file) } className="btn btn-icon btn-danger">
                                    <i className="fa fa-trash-o"></i>
                                </button>
                            </td>
                        </tr>
                    );
                }.bind(this));

                var filesTable = (
                    <table className="table table-striped">
                        <colgroup>
                            <col/>
                            <col style={{ width: "100%" }} />
                            <col style={{ width: "100px" }}/>
                            <col style={{ width: "12px" }}/>
                        </colgroup>
                        <caption>{ this.getUploadQueueSize() } Files in the Queue
                            { uploadProgressBar }
                        </caption>
                        <thead>
                            <th>Name</th>
                            <th>Upload Progress</th>
                            <th>Size (bytes)</th>
                            <th>&nbsp;</th>
                        </thead>
                        <tbody>
                            { fileNodes }
                        </tbody>
                    </table>
                )
            }

            return (
                <div className="uploader">
                    <form action={"https://" + Config.s3_bucket + ".s3.amazonaws.com/"} method="POST" encType="multipart/form-data" className="form-upload">
                        <input type="hidden" name="key" value={ Config.s3_folder + "${filename}" }/>
                        <input type="hidden" name="AWSAccessKeyId" value={ Config.aws_access_key_id }/>
                        <input type="hidden" name="acl" value={ Config.s3_acl }/>
                        <input type="hidden" name="policy" value={ Config.s3_policy }/>
                        <input type="hidden" name="signature" value={ Config.s3_signature }/>
                        <input type="hidden" name="success_action_status" value={ Config.s3_success_action_status } />
                        <input type="hidden" name="x_amz_meta_instructions" value={ Config.x_amz_meta_instructions } />

                        <div className="btn btn-success">
                            <input type="file" name="file" className="input-file" multiple="multiple" accept="image/*" onChange={ this.onClickAddFiles }/>
                            <i className="fa fa-plus"></i>Add files...
                        </div>

                        <button type="submit" className="btn btn-primary" onClick={ this.onClickStartUpload } disabled={ this.state.files.length == 0 || this.getUploadProgressPercent() >= 100 }>
                            <i className="fa fa-upload"></i>Start upload
                        </button>
                        <button type="reset" className="btn btn-warning" onClick={ this.onClickCancelUpload } disabled={ this.state.files.length == 0 }>
                            <i className="fa fa-ban"></i>Cancel upload
                        </button>

                        { filesTable }
                    </form>
                </div>
            );
        }
    });

    return Uploader;
});
