var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var baseDirectory = __dirname   // or whatever base directory you want

var port = 3000;

http.createServer(function (request, response) {
   try {
     var requestUrl = url.parse(request.url)

     var pathname = /^\/$/.test(requestUrl.pathname)
      ? '/index.html'
      : requestUrl.pathname;

      console.log(pathname);

      var type;

      if (/\.css$/i.test(pathname)) {
        type = 'text/css';
      } else if (/\.js$/i.test(pathname)) {
        type = 'application/javascript';
      } else if (/\.htm(.{0,3})$/i.test(pathname)) {
        type = 'text/html'
      } else {
        type = 'text/plain';
      }

     // need to use path.normalize so people can't access directories underneath baseDirectory
     var fsPath = baseDirectory + path.normalize(pathname);

     response.writeHead(200, {  });
     var fileStream = fs.createReadStream(fsPath);
     fileStream.pipe(response);
     fileStream.on('error',function(e) {
         response.writeHead(404);     // assume the file doesn't exist
         response.end();
     })
   } catch(e) {
     response.writeHead(500);
     response.end()     // end the response so browsers don't hang
     console.log(e.stack)
   }
}).listen(port)

console.log("listening on port " + port)