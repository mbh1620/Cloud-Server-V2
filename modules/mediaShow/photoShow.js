function photoShow(filename) {

    console.log(path+"/"+filename)
    console.log(path)
    $("#photoCurrentPath").val(path);
    $("#photoFileName").val(filename)
    $("#photoFormData").submit();
  }