// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const path = require('path');
const util = require('util');
const fs = require('fs');
const youtubedl = require('youtube-dl');

// Optional arguments passed to youtube-dl.

$('.form-submit').on('click', function(event){
    event.preventDefault();
    let searchURL = $('#searchURL').val();
    getInfo(searchURL);
});

$('#search-details').on('click', '.download-video', function(event){
    // event.preventDefault();
    let url = $(this).data('url');
    // alert(url);
    downloadVideo(url);
});
function getInfo(infoUrl){
    let url = infoUrl;
    let html = '';
    youtubedl.getInfo(url, function(err, info) {
        if (err) throw err;
        
        if(util.isArray(info)){
            info.forEach(function(element) {
                let downloadURL = "https://www.youtube.com/watch?v=";
                html += '<div class="row">';
                html +=     '<div class="col-xs-12">';
                html +=         '<h3>' + element.title + '</h3>';
                html +=     '</div>';
                html +=     '<div class="col-xs-3">';
                html +=         '<img src="'+ element.thumbnail +'" class="img-responsive"/>';
                html +=     '</div>';
                html +=     '<div class="col-xs-9">';
                html +=         '<h5>' + element._filename + '</h5>';
                html +=         '<button class="btn btn-default download-video" data-url="'+downloadURL.concat(info.id)+'" type="submit">Download</button><p class="precentage"></p>';
                html +=     '</div>';
                html += '</div>';
                // console.log('id:', element.id);
                // console.log('title:', element.title);
                // console.log('url:', element.url);
                // console.log('thumbnail:', element.thumbnail);
                // console.log('description:', element.description);
                // console.log('filename:', element._filename);
                // console.log('format id:', element.format_id);
            }, this);
            
        }else {
            let downloadURL = "https://www.youtube.com/watch?v=";
            html += '<div class="row">';
            html +=     '<div class="col-xs-12">';
            html +=         '<h3>' + info.title + '</h3>';
            html +=     '</div>';
            html +=     '<div class="col-xs-3">';
            html +=         '<img src="'+ info.thumbnail +'" class="img-responsive"/>';
            html +=     '</div>';
            html +=     '<div class="col-xs-9">';
            html +=         '<h5>' + info._filename + '</h5>';
            html +=         '<button class="btn btn-default download-video" data-url="'+downloadURL.concat(info.id)+'" type="submit">Download</button><p class="precentage"></p>';
            html +=     '</div>';
            html += '</div>';

            console.log('id:', info.id);
            console.log('title:', info.title);
            console.log('url:', info.url);
            // console.log('thumbnail:', info.thumbnail);
            // console.log('description:', info.description);
            // console.log('filename:', info._filename);
            // console.log('format id:', info.format_id);
            
        }
        $('#search-details').append(html);
    });
}
function downloadVideo(url){
    let video = youtubedl(url,
    // Optional arguments passed to youtube-dl.
    ['--format=18'],
    // Additional options can be given for calling `child_process.execFile()`.
    { cwd: __dirname });

    // Will be called when the download starts.
    let size = 0
    video.on('info', function(info) {
        size = info.size;
        console.log('Download started');
        console.log('filename: ' + info._filename);
        console.log('size: ' + info.size);
        let output = path.join(__dirname + '/', info._filename + '.mp4');
        video.pipe(fs.createWriteStream(output));
    });

    
    let pos = 0;
    video.on('data', function data(chunk) {
        pos += chunk.length;
        // `size` should not be 0 here.
        if (size) {
            let percent = (pos / size * 100).toFixed(2);
            
            console.log(percent + '%');
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write(percent + '%');
        }
    });

}
function downloadPlaylist(url){
    let video = youtubedl(url);
    video.on('error', function error(err) {
        console.log('error 2:', err);
    });
    let size = 0;
    video.on('info', function(info) {
        size = info.size;
        let output = path.join(__dirname + '/', info._filename + '.mp4');
        video.pipe(fs.createWriteStream(output));
    });
    let pos = 0;
    video.on('data', function data(chunk) {
        pos += chunk.length;
        // `size` should not be 0 here.
        if (size) {
            let percent = (pos / size * 100).toFixed(2);
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write(percent + '%');
        }
    });

    video.on('next', downloadPlaylist);
}