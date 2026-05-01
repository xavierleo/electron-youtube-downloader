// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const path = require('path');
const youtubedl = require('youtube-dl-exec');

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
async function getInfo(infoUrl){
    let url = infoUrl;
    let html = '';
    try {
        let info = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true
        });
        let entries = Array.isArray(info.entries) ? info.entries : [info];

        entries.forEach(function(element) {
            let downloadURL = element.webpage_url || element.original_url || element.url || url;
            html += '<div class="row">';
            html +=     '<div class="col-xs-12">';
            html +=         '<h3>' + element.title + '</h3>';
            html +=     '</div>';
            html +=     '<div class="col-xs-3">';
            html +=         '<img src="'+ element.thumbnail +'" class="img-responsive"/>';
            html +=     '</div>';
            html +=     '<div class="col-xs-9">';
            html +=         '<h5>' + (element.filename || element.fulltitle || element.title) + '</h5>';
            html +=         '<button class="btn btn-default download-video" data-url="'+downloadURL+'" type="submit">Download</button><p class="precentage"></p>';
            html +=     '</div>';
            html += '</div>';
        }, this);
        $('#search-details').append(html);
    } catch (err) {
        console.error(err);
        $('#search-details').append('<p class="text-danger">Unable to fetch video details.</p>');
    }
}
function downloadVideo(url){
    let video = youtubedl.exec(url, {
        format: 18,
        output: path.join(__dirname, '%(title)s.%(ext)s'),
        newline: true
    }, { cwd: __dirname });

    video.stderr.on('data', function data(chunk) {
        let output = chunk.toString();
        let match = output.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
        if (match) {
            $('.precentage').text(match[1] + '%');
        }
        console.log(output);
    });

    video.catch(function(err) {
        console.error(err);
        $('.precentage').text('Download failed');
    });

}
function downloadPlaylist(url){
    downloadVideo(url);
}
