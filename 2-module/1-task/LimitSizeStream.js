const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.fileLength = 0;
  }

  _transform(chunk, encoding, callback) {
    this.fileLength += chunk.length;

    if (this.fileLength > this.limit) {
      callback(new LimitExceededError);
    }

    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
