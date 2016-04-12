require('should')
var async = require('async');

var testUtils = require('./testUtils');
var errorMessage = require('../errorMessages/errorMessages');
var mongo_dcm_core = require('../index')

describe('version', function() {

    var filepath = "./test/testAsset/testTextFile.txt";
    var fileDetailsForVersion = [{
        document: {
            filePath: filepath,
            fileName: "testTextFile.txt",
            contentType: "binary/octet-stream",
            identityMetaData: {
                projectId: 10
            }
        },
        additonalFileData: { comment: 'First comment For File testTextFile.txt' }
    },
        {
            document: {
                filePath: filepath,
                fileName: "testTextFile.txt",
                contentType: "binary/octet-stream",
                identityMetaData: {
                    projectId: 11
                }
            },
            additonalFileData: { comment: 'First comment For File testTextFile.txt' }
        },
        {
            document: {
                filePath: filepath,
                fileName: "testTextFile.txt",
                contentType: "binary/octet-stream",
                identityMetaData: {
                    projectId: 10
                }
            },
            additonalFileData: { comment: 'second comment For File testTextFile.txt' }
        },
        {
            document: {
                filePath: filepath,
                fileName: "testImage.jpg",
                contentType: "binary/octet-stream",
                identityMetaData: {
                    projectId: 10
                }
            },
            additonalFileData: { comment: 'First comment For File testImage.jpg' }
        }];


    before(function(done) {
        this.timeout(5000);
        async.series([function(callback) {
            testUtils.clearDb(callback);
        },
            function(callback) {
                mongo_dcm_core.connect(testUtils.dbUrl);
                async.eachSeries(fileDetailsForVersion, function(file, cb) {
                    mongo_dcm_core.uploadFile(file.document, file.additonalFileData, cb);
                }, callback);
            }
        ], done);
    });

    it('should get all file versions', function(done) {
        var fileDetailsForFileSearch = {
            fileName: "testTextFile.txt",
            identityMetaData: {
                projectId: 10
            }
        }
        mongo_dcm_core.getAllversionsOfFile(fileDetailsForFileSearch, function(err, sucess) {
            if (err) {
                return done(err);
            }
            else {
                sucess.length.should.equal(2);
                sucess[0].hasOwnProperty("_id");
                sucess[0].hasOwnProperty("filename");
                sucess[0].hasOwnProperty("contentType");
                sucess[0].hasOwnProperty("uploadDate");
                sucess[0].hasOwnProperty("metadata");
                sucess[0].metadata.should.not.equal(null);
                sucess[0].metadata.should.not.equal(undefined);
                sucess[0].metadata.versionNumber.should.equal(2);
                sucess[1].hasOwnProperty("metadata");
                sucess[1].metadata.should.not.equal(null);
                sucess[1].metadata.should.not.equal(undefined);
                sucess[1].metadata.versionNumber.should.equal(1);
                done();
            }
        });
    });
    it('should return error of file not found', function(done) {
        var fileDetailsForFileSearch = {
            fileName: "sourceFileForTest2.txt",
            identityMetaData: {
                projectId: 10
            }
        }
        mongo_dcm_core.getAllversionsOfFile(fileDetailsForFileSearch, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileNotFound);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }
        });
    });
    it('should return error of file details not found', function(done) {
        var fileDetailsForFileSearch;
        mongo_dcm_core.getAllversionsOfFile(fileDetailsForFileSearch, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileDetailsAreMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }
        });
    });
    it('should return error file name not found', function(done) {
        var fileDetailsForFileSearch = {
            fileDetails: {
                identityMetaData: {
                    projectId: 10
                }
            }
        }
        mongo_dcm_core.getAllversionsOfFile(fileDetailsForFileSearch, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileNameMissingOnGetAllVersion);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }
        });
    });
});


