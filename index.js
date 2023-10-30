var userEmail = "admin@gofmx.com"
var password = "U5fziWIJ"
var requestTypeID = 302890
var customFieldIDDictionary = [
    {'gasLeaks' : 614437},
    {'mechHVACID' : 614438},
    {'sewerID' : 616346},
    {'interiorSurfacesID' : 616346},
    {'overallCleanlinessID' : 616347},
    {'pestVerminInfestationID' : 616348},
    {'electricalID' : 616349},
    {'restroomsID' : 616350},
    {'sinksFountainsID' : 616351},
    {'fireSafetyID' : 616352},
    {'hazardousMaterials' : 616353},
    {'structuralDamage' : 616354},
    {'roofs' : 616355},
    {'playgroundGrounds' : 616356},
    {'windowsDoorsGatesFences' : 616357}
]

async function getOccurrences() {
    console.log("this will call the API");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YWRtaW5AZ29mbXguY29tOlU1ZnppV0lK");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch("https://joshua-moore.gofmx.com/api/v1/inspections/occurrences?fields=id%2Ctask(buildings(name)%2ClocationResource(name))%2Cactions%2CexecutionTimeUtc&statuses=Completed&requestTypeIDs=" + requestTypeID, requestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));
}

function getOccurrenceFieldValue(occurrence, customFieldID) {
    var occurrenceExecution = occurrence.actions.find(a => a.kind == "WorkTaskOccurrenceExecution")
    var executionField = occurrenceExecution.customFields.find(f => f.customFieldID == customFieldID)
    if (!occurrenceExecution || !executionField) {
        return undefined
    }
    return executionField.value
}

function getAllOccurrenceFields(occurrence) {
    var occurrenceCustomFieldValues = []
    for (var i in customFieldIDDictionary) {
        var dictionary = customFieldIDDictionary[i]
        var customFieldName = Object.keys(dictionary)
        var customFieldID = dictionary[customFieldName]
        occurrenceCustomFieldValues.push({
            [customFieldName] : getOccurrenceFieldValue(occurrence, customFieldID)
        })
    }

    return occurrenceCustomFieldValues
}

async function getEvaluationData() {
    var evaluationData = []
    var occurrences = await getOccurrences();

    for(var i = 0; i < occurrences.length; i++) {
        var occurrence = occurrences[i];
        console.log(occurrence);
        evaluationData.push({
            'executionDate' : occurrence.executionTimeUtc,
            'building' : occurrence.task.buildings[0].name,
            'location' : occurrence.task.locationResource.name,
            'comments' : occurrence.actions.find(a => a.kind == "WorkTaskOccurrenceExecution").comments,
            'customFields' : getAllOccurrenceFields(occurrence)
        });
    }
    console.log(evaluationData)
    return evaluationData
}