const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.text = '';
  }

  _transform(chunk, encoding, callback) {
    this.text += chunk.toString();

    const arrText = this.text.split(os.EOL);
    this.text = arrText.pop();

    arrText.forEach(str => this.push(str));

    callback();
  }

  _flush(callback) {
    if (this.text) {
      this.push(this.text);
    }

    callback();
  }
}

module.exports = LineSplitStream;

