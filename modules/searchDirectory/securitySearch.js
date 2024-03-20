var editFileTypes = ['txt', 'html', 'js', 'py']
var photoFileType = ['jpeg', 'jpg', 'png', 'tiff']

function searchDirectory(path, callback){

    //Send half path back to server and receive files in that directory 

    $.post('/storage/searchDirectory',{
        path:path
    }, 
    function (data, status){
        callback(data);
    })
}

function updateList(returnedFiles, isEditFlag){

    var list = document.getElementById("list")
    list.innerHTML = "";
    var listId = "#list"

    for(var i = 0; i < returnedFiles.length; i++){

        innerText = ""

        switch(returnedFiles[i].fileType){

            case "File":
                innerText += addFileToList(returnedFiles[i])
                break;

            case "Directory":
                innerText += addDirectoryToList(returnedFiles[i])
                break;

        }

        var listHTML = ""
        

        
        listHTML = "<button onclick='editPermissions(`" + returnedFiles[i].filename + "`)' style='float:right;margin-left:20px; margin-top:0px;' class='btn btn-sm btn-primary'>Edit Permissions</button>"
        
        $(listId).append(
            $('<li/>')
            .attr("id", i)
            .addClass("list-group-item")
            .html(listHTML)
        );

        //Append to list item

        appendToListItem(i, returnedFiles[i], innerText, returnedFiles.length)
        
    }
}


function addFileToList(fileObject){

    var text = "";

    //Get the fileExtension

    fileObject.fileExtension = fileObject.filename.split(".").pop();

    text += "<i style='font-size:20; margin-right:20px;'"

    switch(fileObject.fileExtension.toLowerCase()){

        case "txt":
            text += "class='fas fa-file-word'></i>"
            break;

        case "png":
            text += "class='fas fa-image'></i>"
            break

        case "jpg":
            text += "class='fas fa-image'></i>"
            break;

        case "jpeg":
            text += "class='fas fa-image'></i>"
            break;

        default:
            text += "class='fas fa-file'></i>"
            break;
    }

    return text

}

function addDirectoryToList(fileObject){

    var text;
    
    //File Extension not needed as it is a folder

    fileObject.fileExtension = "Folder"

    text = "<i style='font-size:20;margin-right:20px;' class='fas fa-folder'></i>"

    return text

}

function appendToListItem(iterator, fileObject, innerText, arraySize){

    if(fileObject.fileExtension == "mov"){

        $('#' + iterator).append(
            $("<a/>")
            .attr("href", "#")
            .attr("onclick", 'videoShow("' + fileObject.filename + '")')
            .html(innerText + '' + fileObject.filename)
            .append(
              $("<em/>")
                .attr("style", "float:right")
                .text(fileObject.stats.mtime.split("T")[0] + " " + parseFloat(fileObject.stats.size / 1000000000).toFixed(3) + " Gb")
            )
        )

    } else if (photoFileType.includes(fileObject.fileExtension.toLowerCase())){
        $('#' + iterator).append(
            $("<a/>")
              .attr("href", "#")
              .attr("onclick", 'photoShow("' + fileObject.filename + '","' + iterator + '","' + arraySize + '")')
              .html(innerText + '' + fileObject.filename)
              .append(
                $("<em/>")
                  .attr("style", "float:right")
                  .text(fileObject.stats.mtime.split("T")[0] + " " + parseFloat(fileObject.stats.size / 1000000000).toFixed(3) + " Gb")
              )
          )
    } else if (fileObject.fileType == 'File' && fileObject.fileExtension != 'mov') {
        $('#' + iterator).append(
            $("<a/>")
              .attr("href", "#")
              .attr("onclick", "downloadFile('" + fileObject.filename + "')")
              .attr("download", fileObject.filename)
              .html(innerText + '' + fileObject.filename)
              .append(
                $("<em/>")
                  .attr("style", "float:right")
                  .text(fileObject.stats.mtime.split("T")[0] + " " + parseFloat(fileObject.stats.size / 1000000000).toFixed(3) + " Gb")
              )
          )
    } else {
        $('#' + iterator).append(
            $("<a/>")
              .attr("href", "#")
              .attr("onclick", 'updateDirectory("' + fileObject.filename + '")')
              .html(innerText + '' + fileObject.filename)
              .append(
                $("<em/>")
                  .attr("style", "float:right")
                  .text(fileObject.stats.mtime.split("T")[0] + " " + parseFloat(fileObject.stats.size / 1000000000).toFixed(3) + " Gb")
              )
          )
    }
}

function updateDirectory(newDirectory){

    path = pathJoin(path, newDirectory)

    //use the searchdirectory function and the update breadcrumb

    console.log(path)

    buildBreadcrumb(path)

    searchDirectory(path, function(files){
        updateList(files, false)
    })
}

function pathJoin(startPath, endPath){

    var outputPath = ""

    if(startPath[startPath.length-1]== "/"){

        outputPath = startPath + endPath

    } else {
        outputPath = startPath + "/" + endPath
    }

    return outputPath;

}

function homeDirectory(){

    if(window.path != "/"){
      window.path = "/"

      buildBreadcrumb(path)
  
      searchDirectory(path, function(files){
        updateList(files, false)
      })
    } else {

    }
}

