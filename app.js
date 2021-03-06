/**
* Module dependencies.
*/
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
//var methodOverride = require('method-override');
var session = require('express-session');
var app = express();
var mysql      = require('mysql');
var bodyParser=require("body-parser");
var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'comp5322',
              password : 'comp5322project',
              database : 'comp5322'
            });
 
connection.connect();
 
global.db = connection;


//CK @ 2018-03-31, integrate with Shawn's code start
// First Integration Part
const url = require('url')
const fs = require('fs')
const util = require('util')
const events = require('events')

const template = require('art-template')
const formidable = require('formidable')
const WebSocket = require('ws')
const ffmpeg = require('fluent-ffmpeg')

function display_upload_file_html(request,response){
  return new Promise((resolve,reject)=>{
      let file_path = __dirname+'/views/upload_file.html'
      response.writeHead(200,{
          'Content-type':'text/html'
      })
      response.end(template(file_path,{title:'Upload File'}))
      resolve()
  })
}
global.display_upload_file_html = display_upload_file_html;

function display_my_video_html(request,response){
  return new Promise((resolve,reject)=>{
      let file_path = __dirname+'/views/my_video.html'
      response.writeHead(200,{
          'Content-type':'text/html'
      })
      response.end(template(file_path,{title:'My Meme'}))
      resolve()
  })
}
global.display_my_video_html = display_my_video_html;

function display_static_resoures(request,response){
  return new Promise((resolve,reject)=>{
      let pathname = url.parse(request.url,true).pathname
      let file_path = __dirname + pathname
      fs.readFile(file_path,(err,file_content)=>{
          if(err){
              reject(err)
              return
          }
          response.writeHead(200)
          response.end(file_content)
          resolve()
      })
  })
}
global.display_static_resoures = display_static_resoures;

function upload_process(request,response){
  return new Promise((resolve,reject)=>{
      if(request.method.toLowerCase() !== 'post'){
          return
      }
      let form = new formidable.IncomingForm()
      form.uploadDir = __dirname+'/static/uploaded'
      form.maxFileSize = 50 * 1024 * 1024
      form.keepExtensions = true
      form.parse(request, function(err, fields, files) {
          if(err){
              reject(err)
          }else{
              let single_file = files.file
              resolve(single_file.path)
          }
      })
  })
}
global.upload_process = upload_process;

function call_ffmpeg(file_path){
  let ffmpeg_instance = ffmpeg(file_path)
  return new Promise((resolve,reject)=>{
      ffmpeg_instance.addOptions([
          '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
          '-level 3.0',

          '-start_number 0',     // start the first .ts segment at index 0
          '-hls_time 10',        // 10 second segment duration
          '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
          '-f hls'               // HLS format
      ])
      .output('static/video/output.m3u8')
      .on('progress',progress=>{
          eventEmit.emit('segmentation_process', progress.percent)
      })
      .on('error',(err, stdout, stderr)=>{
          reject(err)
      })
      .on('end',()=>{
          eventEmit.emit('segmentation_process', 100)
          resolve()
      })
      .run()
  })
}
global.call_ffmpeg = call_ffmpeg;
//Integrate with Shawn's code end
 
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))
 

 
app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post 
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile
app.get('/home/upload_video',user.uploadvideo);//to render upload_file.html
app.get('/home/my_video',user.myvideo);//to render my_video.html
app.get('/static/*', display_static_resoures);  //static resources
app.post('/upload', async function(request,response) {
   let uploaded_file_path = await upload_process(request,response)
      await call_ffmpeg(uploaded_file_path);
});
//Middleware
// Second Integration Part of Shawn's code ( due to websocket )

let eventEmit = new events.EventEmitter()

let server = http.createServer(app)

let ws = new WebSocket.Server({
    server:server,
    path:'/test_api'
})

ws.on('connection',(socket)=>{
    eventEmit.on('segmentation_process',percentage=>{
        socket.send(percentage)
    })
})

server.listen(8080,()=>{
    console.log('http://localhost:8080')
})