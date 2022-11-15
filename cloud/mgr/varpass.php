<?php
?>

<script>
    function reqListener () {
      console.log(this.responseText);
    }

    var oReq = new XMLHttpRequest(); // New request object
    oReq.onload = function() {
        // This is where you handle what to do with the response.
        // The actual data is found on this.responseText

        var vars = JSON.parse(this.responseText);

        Object.keys(vars).foreach(function(key) {
            console.log('Key : ' + key + ', Value : ' + vars[key]);
        }
        );

        alert(); // Will alert: 42
        alert(this.responseTest);
    };
    oReq.open("get", "vardata.php", true);
    //                               ^ Don't block the rest of the execution.
    //                                 Don't wait until the request finishes to
    //                                 continue.
    oReq.send();
</script>