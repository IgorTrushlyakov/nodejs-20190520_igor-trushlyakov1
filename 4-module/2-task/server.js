const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.match('[\\/]')) {
        res.statusCode = 400;
        res.end('path is nested');
      }

      const limitedStream = new LimitSizeStream({limit: 1048576});

      req
        .pipe(limitedStream)
        .on('error', (err) => {
          err.statusCode = 413;
          fs.unlink(filepath, () => {});
          res.end();
        })
        .pipe(fs.createWriteStream(filepath, {flags: 'wx'}))
        .on('error', err => {
          if (err.code === 'EEXIST') {
            res.statusCode = 409;
            res.end('already exist');
          } else {
            res.statusCode = 500;
            res.end('server error')
          }
        })
        .on('close', () => {
          res.statusCode = 201;
          res.end('ok')
        });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }

  req.on('close', () => {
    if (res.finished) {
      return;
    }
    fs.unlink(filepath, () => {});
  });

});

module.exports = server;
