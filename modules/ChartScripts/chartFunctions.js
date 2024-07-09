
//https://plotly.com/javascript/colorscales/#greens-colorscale <---- add Heatmaps using plotly.js

function prepareData(data, xField, yField){

    outputArray = []

    for(var i = 0; i < data.record.length; i++){

        outputArray.push({
            x: data.record[i][xField],
            y: data.record[i][yField]
        })

    }

    return outputArray

}

function returnFrequencyOfData(data){

    //Eventually needs to be parallelised similar to database Sum function.

    var frequencies = {}

    for(var i = 0; i < data.length; i++){

        if(frequencies[data[i]['x']] == undefined){

            frequencies[data[i]['x']] = 1

        } else {

            frequencies[data[i]['x']] += 1

        }

    }

    return frequencies

}

function populateChart(chartElement, chartName, chartType, xField, yField, data, dataSchema){

    var options = {}

    dataSchema['recordId'] = 'string'
    dataSchema['dateTime'] = 'date'

    if (dataSchema[xField] == 'date'){

        data.sort((a,b) => new Date(a['x']) - new Date(b['x']));

    } else if(dataSchema[yField] == 'date'){

        data.sort((a,b) => new Date(a['y']) - new Date(b['y']));

    }

    switch(chartType) {

        case 'line':
            options = createLineChart(data, xField, yField, dataSchema)
            break;
        case 'bar':
            options = createBarChart(data, xField, yField, dataSchema)
            break;
        case 'scatter':
            options = createScatterChart(data, xField, yField, dataSchema)
            break;
        case 'frequency':
            yField = `Number of ${xField}`
            options = createFrequencyChart(data, xField, yField, dataSchema)
            break;
        case 'histogram':
            options = createHistogramChart(data, xField, yField, dataSchema)
            break;
        case 'pie':
            options = createPieChart(data)
            break;
        case 'doughnut':
            options = createDoughnutChart(data)
            break;

    }

    if(chartType != 'pie' && chartType != 'doughnut'){

        options.options.scales.x['title']={
            display:true,
            text:xField
        }
        
        options.options.scales.y['title']={
            display:true,
            text:yField
        }

    }
    
    var chart = new Chart(chartElement,options);

    return chart;

}

function addNewDataSetToChart(chart, chartType, data, xAxisSelection, schema){

    if(chartType == 'frequency' || chartType == 'pie' || chartType == 'doughnut'){

        data = returnFrequencyOfData(data)

    }

    if(checkFieldDataType(xAxisSelection, schema) == 'date'){

        data = turnDataIntoDateObjects(data, 'x')

    }

    var colour = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
    var dataset = {
            fill: false,
            label: `Data ${chart.data.datasets.length+1}`,
            lineTension: 0,
            borderWidth: '1',
            data: data,
            borderColor: colour,
            backgroundColor:colour,
            pointRadius: 2,
        }
    
    chart.data.datasets.push(dataset)

    chart.update()

    return chart

}

function createLineChart(data, xAxisField, yAxisField, schema){

    var options =  {
        // The data for our dataset
        type: 'line',
        // responsive: true,
        data: {
            datasets: [{
                fill: false,
                label: 'Data 1',
                lineTension: 0,
                borderWidth: '1',
                data: data,
                pointRadius: 0.5,
            }]
        },
        options:{
            scales: {
                x: {

                },
                y: {

                }
            }
        }
    }

    switch(checkFieldDataType(xAxisField, schema)){

        case 'string':
            //Should be fine in the default setting
            break;
        case 'number':
            //Make the xAxes type linear
            options.options.scales.x.type = 'linear'
            break;

        case 'time':
            //Set the time unit to seconds, minutes or hours
            var dateData = turnDataIntoDateObjects(data, 'x')
            options.data.datasets[0].data = dateData
            options.options.scales.x.type = 'time'
            options.options.scales.x.time = {
                time:'minutes'
            }
            break;
        case 'date':
            //Set the time unit to above a days, months or years
            var dateData = turnDataIntoDateObjects(data, 'x')
            options.data.datasets[0].data = dateData
            options.options.scales.x.type = 'time'
            options.options.scales.x.time = {
                time:'months'
            }
            break;
    }

    switch(checkFieldDataType(yAxisField, schema)){

        case 'number':
            //Should be fine as default
            break;
        case 'string':
            //Make the yAxis categorical
            options.options.scales.y = {
                type:'category',
                offset:true,
                labels:[]
            }
            break;
    }

    return options

}

function createScatterChart(data, xAxisField, yAxisField, schema){

    var options =  {
        // The data for our dataset
        type: 'scatter',
        data: {
            datasets: [{
                fill: false,
                label: 'Data 1',
                lineTension: 0,
                borderWidth: '1',
                data: data,
                pointRadius: 2,
            }]
        },
        options:{
            scales: {
                x: {
                
                },
                y: {

                }
            }
        }
    }

    switch(checkFieldDataType(xAxisField, schema)){

        case 'string':
            //Should be fine in the default setting
            options.options.scales.x.type = 'category'
            break;
        case 'number':
            //Make the xAxes type linear
            options.options.scales.x.type = 'linear'
            break;

        case 'time':
            //Set the time unit to seconds, minutes or hours
            var dateData = turnDataIntoDateObjects(data, 'x')
            options.data.datasets[0].data = dateData
            options.options.scales.x.type = 'time'
            options.options.scales.x.time = {
                time:'minutes'
            }
            break;
        case 'date':
            //Set the time unit to above a days, months or years
            var dateData = turnDataIntoDateObjects(data, 'x')
            options.data.datasets[0].data = dateData
            options.options.scales.x.type = 'time'
            options.options.scales.x.time = {
                time:'months'
            }
            break;
    }

    switch(checkFieldDataType(yAxisField, schema)){

        case 'number':
            //Should be fine as default
            break;
        case 'string':
            //Make the yAxis categorical
            options.options.scales.y = {
                type:'category',
                offset:true,
                labels:[]
            }
            break;
    }
    
    return options

}

function createBarChart(data){

    var options =  {
        // The data for our dataset
        type: 'bar',
        
        data: {
            labels: [],
            datasets: [{
                fill: false,
                label: 'Data 1',
                lineTension: 0,
                borderWidth: '1',
                data: data,
                pointRadius: 0.5,
            }]
        },
        options:{
            scales: {
                x: {
                
                },
                y: {

                }
            }
        }
    }

    return options

}

function createFrequencyChart(data){

    var frequencies = returnFrequencyOfData(data)

    //Get keys and sort by the values

    let sortable = []

    for (var field in frequencies) {

        sortable.push([field, frequencies[field]])

    }

    sortable.sort(function(a, b){
        return b[1] - a[1];
    })

    frequencies = {}

    for(var i = 0; i < sortable.length; i++){

        frequencies[sortable[i][0]] = sortable[i][1];

    }

    var options =  {
        // The data for our dataset
        type: 'bar',
        
        data: {
            labels: [],
            datasets: [{
                fill: false,
                label: 'Data 1',
                lineTension: 0,
                borderWidth: '1',
                data: frequencies,
                pointRadius: 0.5,
            }]
        },
        options:{
            scales: {
                x: {
                
                },
                y: {

                }
            }
        }
    }

    return options

}

function createDoughnutChart(data){

    var frequencies = returnFrequencyOfData(data)

    backgroundColours = []
    for(var i = 0; i < Object.keys(frequencies).length; i++){

        backgroundColours.push(`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`)
        
    }

    var options =  {
        // The data for our dataset
        type: 'doughnut',
         data: {
            labels: Object.keys(frequencies),
            datasets: [{
            label: 'Data 1',
            data: Object.values(frequencies),
            backgroundColor: backgroundColours,
            hoverOffset: 5
            }],
         },
         options: {
            responsive: false,
         }
    }

    return options
}

function createPieChart(data){

    var frequencies = returnFrequencyOfData(data)

    backgroundColours = []

    for(var i = 0; i < Object.keys(frequencies).length; i++){

        backgroundColours.push(`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`)
        
    }

    var options =  {
        type: 'pie',
         data: {
            labels: Object.keys(frequencies),
            datasets: [{
            label: 'Data 1',
            data: Object.values(frequencies),
            backgroundColor: backgroundColours,
            }],
            hoverOffset: 5
         },
         options: {
            responsive: false,
         }
    }

    return options
}

function createHistogramChart(data){

//Histogram is used to display

/*

How will the bar chart be organised? Will it bucketise data? working out the frequency etc...

In some cases yes in others no.

One case is when dates are used, the data could be bucketized.

Start simple and build up

- start by implementing the simple bar chart which is categorical data along the x axis and numerical data along the y axis

*/

//https://www.educative.io/answers/chartjs---create-a-histogram

}

function checkFieldDataType(field, schema){

    var dataType = schema[field]
    
    return dataType
}

function createFrequencyObject(inputArray){

    var outputObject = {}

    for(var i = 0; i < inputArray.length; i++){

        if(Object.keys(outputObject).includes(inputArray[i])){
            //Increase the count by 1
            outputObject[inputArray[i]] += 1
        } else {
            outputObject[inputArray[i]] = 1
        }

    }

    return outputObject

}

function turnDataIntoDateObjects(data, axis){

    var outputData = []

    for(var i = 0; i < data.length; i++){

        if(axis == 'x'){

            outputData[i] = {
                x: new Date(data[i].x),
                y: data[i].y
            }

        } else if (axis == 'y') {

            outputData[i] = {
                x: data[i].x,
                y: new Date(data[i].y)
            }

        }
    }

    return outputData

}

function saveChart(){

    //Save the various chart Configurations to display

    //Get the various parameters to save
    if($('#chartName').val() == ""){
        alert('You need to give your chart a name!');
        return 0;
    }

    var config = {

        chartName:$('#chartName').val(),
        chartType:$('#chartType').val(),
        dataSource:"",
        dataBase: $('#databaseSelection').val(),
        plotType: "",
        xAxis:$('#x-axis-selection').val(),
        yAxis:$('#y-axis-selection').val(),
        datasetQueries: datasetQueries,        
        mapLayer: "",
        latitude: "",
        longitude: "",
        photoUrlField: "",
        popupDisplayField: ""

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

function getCharts(successCallback){
    var charts;
    $.post({
        type:'POST',
        url:'/chart/getCharts',
        data:{},
        success: successCallback
    })
}

function getChart(chartName, userChartsDatabaseId, successCallback){

    queryDatabase(userChartsDatabaseId, 'String Contains', 'chartName', chartName, successCallback)

}

function updateDashboard(dashboardData, successCallback){

    var dashboardData = JSON.stringify(dashboardData)

    $.post({
        type:'POST',
        url:'/dashboard/update',
        data:{
            dashboardData:dashboardData
        },
        success: successCallback
    })

}

function saveDashboard(dashboardData, successCallback){

    var dashboardData = JSON.stringify(dashboardData)

    $.post({
        type:'POST',
        url:'/dashboard/create',
        data:{
            dashboardData:dashboardData
        },
        success: successCallback
    })

}

function getDashboard(dashboardId, userDashboardsDatabaseId, successCallback){

    queryDatabase(userDashboardsDatabaseId, 'String Match', 'recordId',  dashboardId, successCallback)

}

function getChartConfig(chartId, successCallback){

    $.post({
        url: '/chart/getConfig',
        data: {
            chartId: chartId
        },
        success: successCallback
    })

}
