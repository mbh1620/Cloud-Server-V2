function searchfunction() {
    var input, filter, ul, li, a, i, txtvalue;
    input = document.getElementById('searchinput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("list");
    li = ul.getElementsByTagName('li');

    //Loop through all list items, and hide those who dont match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("a")[0];
      txtvalue = a.textContent || a.innerText;
      if (txtvalue.toUpperCase().indexOf(filter) > -1) {

      } else {
        li[i].remove();
      }
    }
  }

function clearall() {
    ul = document.getElementById("list");
      li = ul.getElementsByTagName('li');
      for (i = 0; i < li.length; i++) {
        li[i].remove();
      }
}

$("#searchinput").on('keyup', function (e) {
    if (e.keyCode !== 8) {
      searchfunction();
    }
    else if (e.keyCode === 8) {
        buildBreadcrumb(path)
        searchDirectory(path, function(files){
            updateList(files, false)
        })
    }
  });