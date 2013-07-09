Backbone.FileModel = (function(_, Backbone) {

    var FileModel = Backbone.Model.extend({

        files: null,
        numFiles: 0,

        // if this is set to true and we have no files added we can
        // force a fallback to the original backbone sync without formdata,
        fallbackToNormal: false,

        // this setting determines how multiple files for the same key are
        // named when adding them to the formdata object
        backendIsPHP: false,

        // by default, empty the files array after every sync
        wipeAfterSync: true,

        // the maximum number of files allowed to add to the model, 0 corresponds to unlimited
        maxNumFiles: 0,

        // the maximum filesize for each file in bytes, 0 corresponds to unlimited
        maxSizeSingle: 0,

        // the maximum filesize for all files combined in bytes, 0 corresponds to unlimited
        maxSizeTotal: 0,

        // when a file violates the maxSizeSingle rule, it will be stored in an array
        // which will be assigned to this property after validate() has been called
        offendingFiles: null,

        addFile: function(key, fileRef) {
            var fileKeyArr;

            if (!key || !fileRef) {
                throw new TypeError('You need to pass in a key and a file reference');
            }

            // lazily create the files object
            this.files = this.files || {};

            // if this is the first item we want to store for the passed key,
            // then we have to create the key's array
            if (!this.files[key]) {
                this.files[key] = [];
            }

            fileKeyArr = this.files[key];

            // now we add all files in the fileRef to the array
            if (fileRef.files && fileRef.files.length) {
                _.each(fileRef.files, function(file) {
                    fileKeyArr.push(file);
                    this.numFiles++;
                }, this);
            }
        },

        getFiles: function(key) {
            if (!this.files) return null;

            if (key) {
                return this.files[key];
            } else {
                return this.files;
            }
        },

        // remove all files or just those for a specific key
        clearFiles: function(key) {
            if (key) {
                if (this.files[key]) {
                    this.numFiles -= this.files[key].length;
                }
                delete this.files[key];
            } else {
                this.files = null;
                this.numFiles = 0;
            }
        },

        validate: function() {
            var maxNumFiles = this.maxNumFiles,
                maxSizeSingle = this.maxSizeSingle,
                maxSizeTotal = this.maxSizeTotal,
                curFileCount = 0,
                curMaxSizeSingle = 0,
                curMaxSizeTotal = 0;

            this.offendingFiles = [];

            _.each(this.files, function(fileKeyArr, key) {
                curFileCount += fileKeyArr.length;

                _.each(fileKeyArr, function(file) {
                    var fileSize = file.size;
                    if (maxSizeSingle && fileSize > maxSizeSingle) {
                        if (fileSize > curMaxSizeSingle) {
                            this.offendingFiles.push(file);
                        }
                        curMaxSizeSingle = fileSize;
                    }

                    curMaxSizeTotal += fileSize;
                }, this);
            }, this);

            if (maxNumFiles && curFileCount > maxNumFiles) {
                return 'invalid_max_num_files';
            }

            if (maxSizeSingle && curMaxSizeSingle > maxSizeSingle) {
                return 'invalid_max_file_size_single';
            }

            if (maxSizeTotal && curMaxSizeTotal > maxSizeTotal) {
                return 'invalid_max_file_size_total';
            }
        },

        sync: function() {
            // only use formdata if we have files added
            // or fallbacktoNormal is set to false
            if (this.numFiles > 0 || !this.fallbackToNormal) {

                // FormData() is only supported by XHR2
                var data = new FormData();

                // append all the files for each key
                // to the FormData-object
                _.each(this.files, function(fileKeyArr, key) {
                    var numFiles = fileKeyArr.length;

                    // if we post to node.js with express, multiple files with the same name
                    // will automatically be converted to an array.
                    // for php square brackets are needed to get the proper result
                    if (numFiles > 1) {
                        key = this.backendIsPHP ? key + '[]' : key;
                    } else {
                        // for a single file we always need to use square brackets
                        // so we can expect to always have an array handed to us
                        key = key + '[]';
                    }

                    _.each(fileKeyArr, function(file) {
                        data.append(key, file);
                    });
                }, this);

                // we also want to submit our normal model data
                data.append('model', JSON.stringify(this.toJSON()));

                // add our custom data to the options-object
                // (not sure if there is a better way)
                arguments[2].data = data;
                arguments[2].contentType = false;
                arguments[2].processData = false;

                // clean up the files array, since we don't want to be posting the same data twice
                if (this.wipeAfterSync) {
                    this.clearFiles();
                }
            }

            // finally just call Backbone.sync normally
            return Backbone.sync.apply(this, arguments);
        }
    });

    return FileModel;
})(_, Backbone);