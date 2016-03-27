define('s3-uploader', ['jquery', 'dirname', 'urldecode'], function($, dirname, urldecode) {

    /**
     * The uploader class
     *
     * @param File file The file to upload
     * @param object formObject The form fields in a key => value object
     * @param string formUrl The url to upload the file to
     * @param string formMethod The form method
     * @param function uploadProgressCallback Triggered as the file is uploaded
     * @param function uploadCompleteCallback Triggered whent he file has finished uploading
     */
    function S3Uploader(file, formObject, formUrl, formMethod, uploadProgressCallback, uploadCompleteCallback) {
        this.file = file;
        this.formObject = formObject;
        this.formUrl = formUrl;
        this.formMethod = formMethod;
        this.uploadProgressCallback = uploadProgressCallback;
        this.uploadCompleteCallback = uploadCompleteCallback;
    }

    /**
     * Upload the file
     */
     S3Uploader.prototype.send = function () {
        var xhr = new XMLHttpRequest();
        this.file.xhr = xhr;

        /**
         * Update the upload progress for this file
         *
         * @param Event e The event
         */
        var uploadProgress = function(file, e) {
            this.uploadProgressCallback(file, e.loaded);
        }.bind(this, this.file);
        xhr.upload.addEventListener("progress", uploadProgress, false);

        /**
         * Triggered when the upload is complete
         *
         * @param Event e The event
         */
        var uploadComplete = function(file, e) {
            if (e.target.status == 201) {
                // Extract the path to the file
                var imagePath = $(e.target.responseXML).find('Key').text();
                var s3folder;
                if (imagePath.match(/\//)) {
                    s3folder = dirname(imagePath);
                } else {
                    s3folder = '';
                }

                var remoteUrl = $(e.target.responseXML).find('Location').text();
                remoteUrl = urldecode(remoteUrl);

                // Trigger the upload complete callback
                this.uploadCompleteCallback(file, true, s3folder, remoteUrl);
            } else {
                this.uploadCompleteCallback(file, false);
            }
        }.bind(this, this.file);
        xhr.addEventListener("load", uploadComplete, false);

        // Assemble the form data
        var form = new FormData();
        for (var j in this.formObject) {
            var key = j;
            if (key.match(/^x_amz_meta_/)) {
                // jQuery Serialize Object doesn't handle names with dashes, so replace the underscores with dashes
                // so that our aws metadata key pairs are valid
                key = key.replace(/_/g, '-');
            }

            form.append(key, this.formObject[j]);
        }
        form.append('file', this.file);

        // Super cEvin Attack Mode Go!
        xhr.open(this.formMethod, this.formUrl, true);
        xhr.send(form);
    };

    return S3Uploader;
});
