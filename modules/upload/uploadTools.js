let dropArea = document.getElementById('drop-area')
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    })

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files)
}

function handleFiles(files, userName) {
    ([...files]).forEach(function(file){
        uploadFile(file, userName)
    })
}

function uploadFile(file, userName) {
    let url = "/uploadfile"
    let form = document.getElementById("fileuploadform")
    let formData = new FormData(form)

    $("#drag-label").text(file.name)
    formData.append('fileElem', file)
    formData.append('filename', file.name)
    formData.append('currentPath', path)
    formData.append('userName', userName)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/uploadfile', true);
    xhr.send(formData)

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        $("#progress-bar").attr("max", event.total);
        $("#progress-bar").val(event.loaded);
      }
    }

    xhr.onreadystatechange = function () {
      $("#progress-bar").val(0);
      $("#drag-label").text("Drag files here to upload")
      $("#drop-area").toggle();

      searchDirectory(path, function (files) {
        updateList(files, isEdit)
      })

    };
  }
