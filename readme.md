# Backbone.FileModel
  Add files to your Backbone.js models and upload them asynchronously with XmlHttpRequest2.

  Since this module requires XHR2, it doesn't work in IE < 10.

  It also makes use of the FileAPI, which also isn't supported in IE < 10.

## API

### addFile(key, fileReference)
  Add all files from the FileList of the `fileReference` to `key`.

### getFiles()
  Get the object which holds all the added keys and their associated files.

### getFiles(key)
  Get the array of File-objects for `key`.

### clearFiles()
  Remove all added files from the model.

### clearFiles(key)
  Remove all added files for `key` from the model.

## Configuration
  The following properties can be set directly on the model:

### fallbackToNormal
  If this is set to `true` and there are no files added to the model a fallback to the original
  sync method of Backbone without formdata can be forced. The default is `false`.

### forceMultiKeyArrayName
 This setting determines how multiple files for the same key are named when adding them
 to the formdata object. If set to `true`, each file for a single key will be added to the formdata
 using `key + '[]'`. This value for this settings depends on your backend. The default is `false`.

### wipeAfterSync
  If set to `true`, after every sync, all the file references will be removed from the model.
  If set to `false`, the file reference will not be removed and will be resubmitted on the next sync.
  The default is `true`.

## Validation
  The following properties can be set directly on the model, and are being used during the
  validation process before the model is being synced with the server:

### maxNumFiles
  The maximum number of files allowed for the model, 0 corresponds to unlimited.

### maxSizeSingle
  The maximum filesize for a single file in bytes, 0 corresponds to unlimited.

### maxSizeTotal
  The maximum filesize for all added files combined in bytes, 0 corresponds to unlimited.

## Events

### filemodel:add
  Everytime a file is added to the model using `addFile(key, fileReference)`,
  this event will be triggered. It gets passed the key the file was added to and
  a FileList which contains the added files.

### filemodel:clear
  When `clearFiles(key)` is called this event will be triggered.
  It gets passed the deleted `key`.

### filemodel:clearAll
  When `clearFiles()` is called without parameters this event will be triggered.

## License
  MIT