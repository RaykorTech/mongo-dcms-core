var async = require('async');
require("should");
var testUtils = require('./testUtils');
var errorMessage = require('../errorMessages/errorMessages');
var dcms_core = require('../index');

describe('Upload File', function() {
    before(function(done) {
        testUtils.clearDb(function() {
            dcms_core.connect(testUtils.dbUrl);
            done();
        });
    });
    it('should add new File', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var fileData = {
            document: {
                filePath: filepath,
                fileName: "testTextFile.txt",
                contentType: "binary/octet-stream",
                identityMetaData: {
                    projectId: 10
                }
            },
            additionalFileData: { comment: "First Upload For document testTextFile.txt" }
        }

        dcms_core.uploadFile(fileData.document, fileData.additionalFileData, function(err, sucess) {
            if (err) {
                err.should.equal(null);
                done();
            }
            else {
                sucess.hasOwnProperty("fileId");
                sucess.hasOwnProperty("fileMetaData");
                sucess.fileMetaData.should.not.equal(null);
                sucess.fileMetaData.should.not.equal(undefined);
                done();
            }
        });
    });

    it('give error of file not found', function(done) {
        var filepath = "./test/testAsset/sourceFileForTestsa.txt";
        var document = {
            filePath: filepath,
            fileName: "sourceFileForTestsa.txt",
            contentType: "binary/octet-stream",
            identityMetaData: {
                projectId: 10
            }
        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.code.should.equal("ENOENT");
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });

    it('should return erroe message document properties not found', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document;
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.documentPropertiesMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }
        });
    });
    it('should give error of path not found if undefined', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document = {
            filePath: "",
            fileName: "testTextFile.txt",
            contentType: "binary/octet-stream",
            identityMetaData: {
                projectId: 10
            }
        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.filePathMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });

    it('should give error of path not found', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document = {
            fileName: "testTextFile.txt",
            contentType: "binary/octet-stream",
            identityMetaData: {
                projectId: 10
            }
        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.filePathMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });

    it('should give error of file name not found', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document = {
            filePath: filepath,
            contentType: "binary/octet-stream",
            identityMetaData: {
                projectId: 10
            }

        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileNameMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });
    it('should give error of file name not found for undefined', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document = {
            filePath: filepath,
            fileName: "",
            contentType: "binary/octet-stream",
            identityMetaData: {
                projectId: 10
            }
        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileNameMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });
    it('should give error of file contentType not found', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document = {
            filePath: filepath,
            fileName: "testTextFile.txt",
            identityMetaData: {
                projectId: 10
            }

        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileContentTypeMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });
    it('should give error of contentType not found for undefined', function(done) {
        var filepath = "./test/testAsset/testTextFile.txt";
        var document = {
            filePath: filepath,
            fileName: "testTextFile.txt",
            contentType: "",
            identityMetaData: {
                projectId: 10
            }
        };
        dcms_core.uploadFile(document, {}, function(err, sucess) {
            if (err) {
                err.should.equal(errorMessage.fileContentTypeMissing);
                done();
            }
            else {
                sucess.should.equal(null);
                done();
            }

        });
    });
});



