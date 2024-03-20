function inputTableData(data, dataSchema, tableId){

    dataSchema['recordId'] = 'string'
    dataSchema['dateTime'] = 'string'

    $('#'+tableId).empty()

    var string = `
        <thead class="thead-dark">
        <tr>
        `

    for(var i = 0; i < Object.keys(dataSchema).length; i++){

        string += `<th>${Object.keys(dataSchema)[i]}</th>`

    }

    string += `
        </tr>
        </thead>
    `

    for(var i = 0; i < data.record.length; i++){
        string += `<tr>`

        for(var j = 0; j < Object.keys(dataSchema).length; j++){

            if(j == 0 ){

                switch(dataSchema[Object.keys(dataSchema)[j]]){

                    case 'photo':
                        string += `<th scope="row"><img style="height:200px;width:auto" src="${data.record[i][Object.keys(dataSchema)[j]]}"></th>`
                        break;
                    case 'fileLink':
                        string += `<th scope="row"><a href="${data.record[i][Object.keys(dataSchema)[j]]}">${data.record[i][Object.keys(dataSchema)[j]]}</a></th>`
                        break;
                    default:
                        string += `<th scope="row">${data.record[i][Object.keys(dataSchema)[j]]}</th>`
                        break;
                }

            } else {

                switch(dataSchema[Object.keys(dataSchema)[j]]){

                    case 'photo':
                        string += `<td><img style="height:200px;width:auto" src="${data.record[i][Object.keys(dataSchema)[j]]}"></td>`
                        break;
                    case 'fileLink':
                        string += `<td><a href="${data.record[i][Object.keys(dataSchema)[j]]}">${data.record[i][Object.keys(dataSchema)[j]]}</a></td>`
                        break;
                    default:
                        string += `<td>${data.record[i][Object.keys(dataSchema)[j]]}</td>`
                        break;
                }

            }

        }

        string += `</tr>`
    }

    string += '</tbody>'

    $('#'+tableId).append(string)

}

function saveTable(){

    if($('#chartName').val() == ""){
        alert('You need to give your chart a name!');
        return 0;
    }

    var config = {
        
        chartName:$('#chartName').val(),
        chartType: 'table',
        dataSource: '',
        dataBase: $('#databaseSelection').val(),
        plotType: '',
        xAxis: '',
        yAxis: '',
        datasetQueries: datasetQueries,
        mapLayer: '',
        latitude: '',
        longitude: '',
        photoUrlField: '',
        popupDisplayField: ''
    
    }

    config = JSON.stringify(config)

    $.post({

        type:'POST', 
        url: '/chart/create',
        data: {
            config: config
        },
        success: function() {
            window.location = "/chart/viewAll/"
        }
    })

}