
var breadCrumbArray = []

function buildBreadcrumb(path) {

    var splitPath = path.split("/")

    splitPath.shift()

    if(window.path == "/"){
      $('#homeDirectoryButton').attr('style', 'color:gray')
      $('#homeDirectoryButton').removeAttr('href')
    } else {
      $('#homeDirectoryButton').attr('style', 'color:light-blue')
      $('#homeDirectoryButton').attr('href', "#")
    }

    var breadCrumbList = []
    breadCrumbArray = splitPath

    $('#breadcrumblist li').each(function () { breadCrumbList.push($(this)) })

    for (var x = 0; x < breadCrumbList.length; x++) {
      $("#b" + x).remove()
    }

    for (var x = 0; x < breadCrumbArray.length; x++) {
      if (x == breadCrumbArray.length - 1) {
        $(".breadcrumb").append(
          $("<li/>")
            .attr("class", "breadcrumb-item")
            .attr("id", "b" + x)
            .text(breadCrumbArray[x])
        )
      } else {
        $(".breadcrumb").append(
          $("<li/>")
            .attr("class", "breadcrumb-item")
            .attr("id", "b" + x)
            .attr("onclick", "updateDeleteBreadCrumb('" + x + "')")
            .append(
              $("<a/>")
                .attr("style", "color:blue;")
                .hover(function () {
                  $(this).attr("style", "color:blue;text-decoration:underline");
                }, function () {
                  $(this).attr("style", "color:blue;text-decoration:none");
                })
                .text(breadCrumbArray[x])
            )
        )
      }
    }
  }

function updateDeleteBreadCrumb(num){

    var times = breadCrumbArray.length - num;

    for(var i = 0; i < $(".breadcrumb .breadcrumb-item").length; i++){

        var item = $(".breadcrumb .breadcrumb-item")[i]

        var itemId = item.getAttribute("id")

        if(itemId != null){

            var splitItemId = itemId.split("b")

            if (splitItemId[1] > num){

                item.remove()
    
            }
        }
    }

    var x = 0

    while(x < times-1){
      x++
      breadCrumbArray.pop();
      path = path.substr(0, path.lastIndexOf("/"))
    }

    buildBreadcrumb(path)

    searchDirectory(path, function(files){
      updateList(files, isEdit)
    })

}