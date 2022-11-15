// Variable passer

function reqListener (){}

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var oReq = new XMLHttpRequest(); // New request object

oReq.onload = function() {
    // This is where you handle what to do with the response.
    // The actual data is found on this.responseText

    if( isJSON(this.responseText) ) {
        var vars = JSON.parse(this.responseText);
    
        // Split JSON and load into local variables
        Object.keys(vars).forEach( function(key) {
            window[key] = vars[key];
            console.log( vars[key] );
        } );

    } else {
        console.log("Not logged in");
    }
}

try {
    oReq.open("get", "vardata.php", true);
    //                               ^ Don't block the rest of the execution.
    //                                 Don't wait until the request finishes to
    //                                 continue.
    oReq.send();
} catch (e) {
    console.log("No vars");
}
