/* global describe, before, it */
require('mocha')
require('should')
var async = require('async')
var testUtils = require('./testUtils')
var errorMessage = require('../errorMessages/errorMessages')
var mongo_dcms_core = require('../index')

describe('should get file Content by file id', function () {
  var filepath = './test/testAsset/testTextFile.txt'
  var savedFileId
  var document = {
    filePath: filepath,
    fileName: 'testTextFile.txt',
    contentType: 'binary/octet-stream',
    identityMetaData: {
      projectId: 10
    }
  }

  before(function (done) {
    this.timeout(5000)
    async.series([
      function (callback) {
        testUtils.clearDb(callback)
      },
      function (callback) {
        mongo_dcms_core.connect(testUtils.dbUrl)
        mongo_dcms_core.uploadFile(document, {}, function (err, sucess) {
          if (err) {
            callback(err)
          } else {
            savedFileId = sucess.fileId
            callback(null)
          }
        })
      }
    ], done)
  })
  it('should get file Content by file id', function (done) {
    mongo_dcms_core.getFileContentByFileId(savedFileId, function (err, sucess) {
      if (err) {
        err.should.equal(null)
        done()
      } else {
        sucess.fileData.should.not.equal(null)
        sucess.contentType.should.equal('binary/octet-stream')
        sucess.fileName.should.equal('testTextFile.txt')
        sucess.fileMetaData.should.not.equal(null)
        sucess.fileMetaData.should.not.equal(undefined)
        done()
      }
    })
  })
  it('should return message file not found', function (done) {
    mongo_dcms_core.getFileContentByFileId('56f0dc0ca80f6cc01929cd1e', function (err, sucess) {
      if (err) {
        err.should.equal(errorMessage.fileNotFoundForSpecifiedFileId)
        done()
      } else {
        sucess.should.equal(null)
        done()
      }
    })
  })
})
