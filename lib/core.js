var path = require("path");
var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var fs = require('fs');
var flatten = require('flat');
var errorMessage = require('../errorMessages/errorMessages');
var async = require('async');
var _ = require('lodash');

var gfs;
var preConnectionOperationQueue =[];
var core = module.exports = {

    connect: function(connectionUrl) {
        gfs = undefined;
        preConnectionOperationQueue = [];
        mongo.MongoClient.connect(connectionUrl, function(err, db) {
            if(err) throw 'fail to connect to database ' + connectionUrl;
            gfs = Grid(db, mongo)
            preConnectionOperationQueue.forEach(function (operation) {
                core[operation.method].apply(core, operation.args);
            });
        });
    },

    uploadFile: function(document, additionalMetadata, cb) {
        if(!gfs) {
            preConnectionOperationQueue.push({method: 'uploadFile',
            args: arguments});
            return ;
        }
        if (!document || document == undefined) {
            return cb(errorMessage.documentPropertiesMissing);
        }
        var identityMetaData = document.identityMetaData;
        var filePath = document.filePath;
        var fileName = document.fileName;
        var fileContentType = document.contentType;

        if (!filePath) {
            return cb(errorMessage.filePathMissing);
        }
        if (!fileName) {
            return cb(errorMessage.fileNameMissing);
        }
        if (!fileContentType) {
            return cb(errorMessage.fileContentTypeMissing);
        }
        var stream = fs.createReadStream(filePath);
        stream.on('error', function(error) {
            if (error) {
                return cb(error);
            }
        });
        var versionNumber;
        var requestedFileQueryForVersion = { filename: fileName };
        if (identityMetaData && identityMetaData != undefined) {
            _.assignIn(requestedFileQueryForVersion, { metadata: identityMetaData });

        }
        var queryToGetFileVersion = flatten(requestedFileQueryForVersion);
        async.waterfall(
            [
                function(callback) {
                    gfs.files.find(queryToGetFileVersion).sort({ 'uploadDate': -1 }).limit(1).toArray(function(err, files) {
                        if (err) {
                            return callback(err);
                        }
                        else {
                            if (files.length < 1) {
                                versionNumber = 1.0;
                                return callback(null, versionNumber);
                            }
                            else {
                                var versionMetadata = _.pick(files[0], 'metadata');
                                versionNumber = parseInt(versionMetadata.metadata.versionNumber) + 1;
                                return callback(null, versionNumber);
                            }
                        }
                    });
                },
                function(versionNumber, callback) {
                    _.assignIn(identityMetaData, { versionNumber: versionNumber });
                    _.assignIn(identityMetaData, additionalMetadata);

                    var writestream = gfs.createWriteStream({
                        filename: fileName,
                        content_type: fileContentType,
                        metadata: identityMetaData
                    });
                    stream.pipe(writestream);
                    writestream.on('close', function(file) {
                        return callback(null, { fileId: file._id, fileMetaData: file.metadata });
                    });
                    writestream.on('error', function(error) {
                        return callback(error);
                    })
                }
            ],
            function(err, result) {
                if (err) {
                    return cb(err);
                }
                else {
                    return cb(null, { fileId: result.fileId, fileMetaData: result.fileMetaData });
                }
            }
        );

    },

    getAllversionsOfFile: function(fileDetails, cb) {
        if(!gfs) {
            preConnectionOperationQueue.push({method: 'getAllversionsOfFile',
            args: arguments});
            return ;
        }
        if (!fileDetails) {
            return cb(errorMessage.fileDetailsAreMissing);
        }
        /*if (!fileDetails.fileName) {
            return cb(errorMessage.fileNameMissingOnGetAllVersion);
        }*/
        var requestedFileQueryForVersion = fileDetails.fileName ? { filename: fileDetails.fileName } : {};
        if (fileDetails.identityMetaData && fileDetails.identityMetaData != undefined) {
            _.assignIn(requestedFileQueryForVersion, { metadata: fileDetails.identityMetaData });

        }
        var queryToGetFileVersion = flatten(requestedFileQueryForVersion);
        gfs.files.find(queryToGetFileVersion).sort({ 'uploadDate': -1 }).project({ '_id': 1, 'filename': 1, 'contentType': 1, 'uploadDate': 1, 'metadata': 1 }).toArray(function(err, files) {
            if (err) {
                return cb(err);
            }
            else {
                if (files.length < 1) {
                    return cb(errorMessage.fileNotFound);
                }
                else {
                    return cb(null, files);
                }
            }
        });
    },

    getFileContentByFileId: function(fileId, cb) {
         if(!gfs) {
            preConnectionOperationQueue.push({method: 'getFileContentByFileId',
            args: arguments});
            return ;
        }
        if (!fileId) {
            return cb('file id is missing');
        }

        async.waterfall(
            [
                function(callback) {
                    gfs.findOne({ _id: fileId }, function(err, file) {
                        if (err) {
                            return callback(err);
                        }
                        else {
                            if (file == undefined || file == null) {
                                return callback(errorMessage.fileNotFoundForSpecifiedFileId);
                            }

                            var fileDownloadMetaData =
                                {
                                    fileRelatedData: {
                                        contentType: file.contentType,
                                        fileName: file.filename,
                                        fileMetaData: file.metadata
                                    }
                                };
                            return callback(null, fileDownloadMetaData);
                        }
                    });
                },
                function(fileDownloadMetaData, callback) {
                    var readstream = gfs.createReadStream({
                        _id: fileId
                    });

                    var fileData = [];

                    readstream.on("error", function(error) {
                        if (error.message == "file with id " + fileId + " not opened for writing")
                            return callback(errorMessage.fileNotFoundForSpecifiedFileId);
                        else {
                            return callback(error.message);
                        }
                    });

                    readstream.on("data", function(data) {
                        fileData.push(data);
                    });
                    readstream.on("end", function() {
                        fileData = Buffer.concat(fileData);
                        var fileDataResponse = { fileData: fileData };
                        _.assignIn(fileDataResponse, fileDownloadMetaData.fileRelatedData);
                        return callback(null, fileDataResponse);
                    });
                }
            ],
            function(error, result) {
                if (error) {
                    return cb(error);
                }
                else {
                    return cb(null, result);
                }
            }
        )
    }
}