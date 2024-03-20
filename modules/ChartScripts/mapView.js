function getCoordinates(receivedData, latitudeField, longitudeField){

    var latitude;
    var longitude;

    var coordinates = []

    //Now we need to do it for all records

    for(var i = 0; i < receivedData.record.length; i++){

        latitude = receivedData.record[i][latitudeField]
        longitude = receivedData.record[i][longitudeField]

        var coordinateRecord = [latitude, longitude]

        coordinates.push(coordinateRecord);

    }
    
    return coordinates
}