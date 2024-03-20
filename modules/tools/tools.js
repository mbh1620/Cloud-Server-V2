//renameFile function


function renameitem(name) {
    $(".renameentry").toggle()
    $("#filename").val(name)
}

$("#renamebox").on('keyup', function (e) {
    if (e.keyCode === 13) {
        renameFile()
    }
});

function renameFile(file) {
    let url = "/rename"
    var oldname = $("#filename").val()
    var newname = $("#renamebox").val()

    $.ajax({
        type: "POST",
        url: '/rename',
        data: { oldname: oldname, newname: newname, currentPath: path },
    });

    renameitem();
    buildBreadcrumb(path)

    searchDirectory(path, function (files) {
        updateList(files, isEdit)
    })
}

function moveItem(filename) {
    $('#formCurrentPath').val(path)
    $('#formFileName').val(filename)
    $('#formData').submit();
}

function createNewFile() {
    $('#formCurrentPath2').val(path)
    $('#formData2').submit();
}

function editTextFile(filename) {
    $("#formCurrentPath3").val(path);
    $("#formFileName3").val(filename);
    $("#formData3").submit();
}

function deleteFile(name) {
    if (confirm(`Are you sure you would like to delete this ${name}`)) {
        $.post('/deletedir', { currentPath: path, name: name })
        searchDirectory(path, function (files) {
            updateList(files, isEdit)
        })
    }
}

function showtext() {
    $(".nameentry").toggle()
}

$("#namebox").on('keyup', function (e) {
    if (e.keyCode === 13) {
        createnewfolder()
    }
});

function createnewfolder() {
    var name = $(".namebox").val()
    $.ajax({
        type: "POST",
        url: '/newfolder',
        data: { name: name, currentPath: path},
    });

    $(".namebox").val("");
    searchDirectory(path, function (files) {
        updateList(files, isEdit)
    })
}

function showUpload() {
    $("#drop-area").toggle();
}
