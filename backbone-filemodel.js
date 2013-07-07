Backbone.FileModel = (function(_, Backbone) {

    var FileModel = Backbone.Model.extend({

        files: null,

        // by default, empty the files array after every sync
        wipeAfterSync: true,

        addFile: function(key, fileRef) {
            var fileKeyArr;
            // lazily create the files object
            this.files = this.files || {};

            // if this is the first item we want to store for the passed key,
            // then we have to create the key's array
            if (!this.files[key]) {
                this.files[key] = [];
            }

            fileKeyArr = this.files[key];

            // now we add all files in the fileRef to the array
            if (key && fileRef && fileRef.files.length) {
                _.each(fileRef.files, function(file) {
                    fileKeyArr.push(file);
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

        clearFiles: function(key) {
            if (key) {
                delete this.files[key];
            } else {
                this.files = null;
            }
        },

        sync: function() {
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

            // finally just call Backbone.sync normally
            return Backbone.sync.apply(this, arguments);
        }
    });

    return FileModel;
})(_, Backbone);