# mongo-dcms-core
> core libarary of mongodb document content management system 

[![Build Status][travis-ci-img]][travis-ci-url] 
[![npm version][npm-version-img]][npm-version-url] 
[![Dependency Status][dependancy-status-img]][dependancy-status-url]

[![NPM](https://nodei.co/npm/mongo-dcms-core.png?downloadRank=true&downloads=true)](https://nodei.co/npm/mongo-dcms-core/)

## Index
* [Install](#install)
* [Usage](#usage)
* [License](#license)

## Install

```bash
npm install mongo-dcms-core --save
```
## Usage
### connect (connectionUrl)

* `ConnectionUrl` : mongodb url e.g mongodb://localhost/dcms-store.

### uploadFile (document,additionalMetadata,callback)
* `document` : an object conatining following properties.
    - `filePath` : path where file is stored.
    - `fileName` : file name to be populated in database.
    - `contentType` : content type of file . e.g. binary/octet-stream.
    - `identityMetaData` : an object containing properties which will uniquely identify document in mongodb.
* `additionalMetadata`: Additional metadata to be stored along with identityMetaData.
* `callback(err, file)` : A callback is called when file is added into mogodb or error occured.
    - `err` : string if error else null.
    - `file` an object containg following properties. 
        - `fileId` : id of mongodb record.
        - `fileMetaData`: metadata of the file.
        
### getAllversionsOfFile (fileDetails, callback)
* `fileDetails` : An object containing following properties
    - `fileName` : file name to search *(optional)*
    - `identityMetaData` : identity metadata to search 
* `callback(err,files)` : A callback is called when search is completed or error occured.
    - `err` : string if error else null.
    - `files` :  An array of file object. File object properties (`_id`, `filename`, `uploadDate` and `metadata`)

### getFileContentByFileId(fileId,callback)
* `fileId` : mongodb `_id`.
* `callback(err,file)` : A callback is called when item found and contents are read or error occured.
     - `file` : 
        - `fileData` : byte array of content.
        - `contentType` : content type as a string.
        - `fileMetadata` : object containing metadata.
        
```js
var mongoDcmsCore = require('mongo-dcms-core');
mongoDcmsCore.connect("mongodb://localhost/dcms-core");
mongoDcmsCore.uploadFile({filePath : '/tmp/appUploads/acd-001f-1234.jpg', fileName : 'profileImage.jpg' ,contentType : 'binary/octet-stream', 'identityMetaData' : {profileId : 12345} },{comment = 'new one at Taj'},function(err,result) {
    if(err) {
        //error handling
    }else {
        // process result
    }
});
```          

## Tests

```js
npm test
```
## License
[MIT][license-url]

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[travis-ci-img]: https://travis-ci.org/RaykorTech/mongo-dcms-core.svg?branch=master
[travis-ci-url]: https://travis-ci.org/RaykorTech/mongo-dcms-core 
[npm-version-img]: https://badge.fury.io/js/mongo-dcms-core.svg
[npm-version-url]: http://badge.fury.io/js/mongo-dcms-core
[dependancy-status-img]: https://gemnasium.com/RaykorTech/mongo-dcms-core.svg
[dependancy-status-url]: https://gemnasium.com/RaykorTech/mongo-dcms-core