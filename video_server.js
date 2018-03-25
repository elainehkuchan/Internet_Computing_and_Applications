const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')
const util = require('util')

const template = require('art-template')
const formidable = require('formidable')
const WebSocket = require('ws')

function display_upload_file_html(request,response){
    return new Promise((resolve,reject)=>{
        let file_path = __dirname+'/views/upload_file.html'
        response.writeHead(200,{
        'Content-type':'text/html'
    })
    response.end(template(file_path,{title:'Upload File'}))
    resolve()
}).catch((err)=>{
        console.error('In upload_file.html, we have got an error:',err)
})
}

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
}).catch((err)=>{
        console.error('In transmitting static resources, system has got an error:',err)
    response.end()
})
}

function display_success_html(request,response){
    return new Promise((resolve,reject)=>{
        let file_path = __dirname+'/views/success.html'
        response.writeHead(200,{
        'Content-type':'text/html'
    })
    response.end(template(file_path,{title:'Success'}))
    resolve()
}).catch((err)=>{
        console.error('In upload_file.html, we have got an error:',err)
})
}

function display_failure_html(request,response){
    return new Promise((resolve,reject)=>{
        let file_path = __dirname+'/views/failure.html'
        response.writeHead(200,{
        'Content-type':'text/html'
    })
    response.end(template(file_path,{title:'Failure'}))
    resolve()
}).catch((err)=>{
    console.error('In upload_file.html, we have got an error:',err)
})
}

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
            resolve()
        }
    })
    }).catch((err)=>{
        console.error('In upload has got an error:',err)
    })
}

async function main(request,response){
    try{
        let pathname = url.parse(request.url,true).pathname
        if(pathname !== '/favicon.ico'){
            if(pathname === '/upload_file.html'){
                await display_upload_file_html(request,response)
            }else if(pathname === '/success.html'){
                await display_success_html(request,response)
            }else if(pathname === '/failure.html'){
                await display_failure_html(request,response)
            }else if(pathname.startsWith('/static')){
                await display_static_resoures(request,response)
            }else if(pathname === '/upload'){
                await upload_process(request,response)
            }else{
                response.writeHead(404,{
                    'Content-type':'text/plain'
                })
                response.end('找不到哦')
            }
        }
    }catch(err){
        console.error('In main function, system meets an error', err)
    }
}

let server = http.createServer(main)

let ws = new WebSocket.Server({
    server:server,
    path:'/test_api'
})
ws.on('connection',(socket)=>{
    let i = 1
    let interval_id = setInterval(()=>{
        if(i <= 100){
            i ++
            socket.send(i)
        }else{
            clearInterval(interval_id)
        }
    },1000)
})

server.listen(8000,()=>{
    console.log('http://localhost:8000/upload_file.html')
})