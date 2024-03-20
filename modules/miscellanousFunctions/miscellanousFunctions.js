

function populateSelectBoxObject(selectBoxId, data, displayField, valueField){

    $(selectBoxId).empty()

    for(var i = 0; i < data.length; i++){

        $(selectBoxId).append(`<option value=${data[i][valueField]}>${data[i][displayField]}</option>`)

    }

}

function populateSelectBoxArray(selectBoxId, arrayData){

    $(selectBoxId).empty()

    for(var i = 0; i < arrayData.length; i++){

        $(selectBoxId).append(`<option value=${arrayData[i]}>${arrayData[i]}</option>`)

    }


}