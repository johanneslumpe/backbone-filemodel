Backbone.FileModel = (function(_, Backbone) {

    var FileModel = Backbone.Model.extend({

        files: null,
        numFiles: 0,

        // if this is set to true and we have no files added we can
        // force a fallback to the original backbone sync without formdata,
        fallbackToNormal: false,

        // by default, empty the files array after every sync
        wipeAfterSync: true,

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

        sync: function() {
            // only use formdata if we have files added
            // or fallbacktoNormal is set to false
            if (this.numFiles > 0 || !this.fallbackToNormal) {

                // FormData() is only supported by XHR2
                var data = new FormData();

                // append all the files for each key
                // to the FormData-object
                _.each(this.files, function(fileKeyArr, key) {
                    _.each(fileKeyArr, function(file) {
                        data.append(key, file);
                    });
                });

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