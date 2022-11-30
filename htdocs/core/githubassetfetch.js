/**
 * @file        varpasser.js
 * @author      Chris Gregg
 * 
 * @brief       Retrives and returs variables from secrets file, but protected by UserSpice permissions
 * 
 * @copyright   Copyright (c) 2022
 * 
 */

/* MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

/* Format of secrets.php file -

<?php
// Secure to only logged in users
require_once '../../../users/init.php';
if (!securePage($_SERVER['PHP_SELF'])) { die(); }
 
// Variables to pass
$<<variable name>> = <<variable value>>;
 
// Add them all to the JSON array
$vars = array(
  "<<variable name>>"=>$<<variable name>>
);

// JSON encode and return
echo json_encode($vars);             
?>

*/


/** @class  Variable Passer
 *  @brief  Retrives and returs variables from secrets file, but protected by UserSpice permissions
 */
class githubassetfetcher {

    /** Construct a new variable passer object
     * @param filepath          String containing path of secrets file to load
     */
    constructor(repo,user) {

        this.valid;                     // Has the secrets file returned a valid JSON - user needs to be logged into UserSpice to do so
        this.repoText;                  // Text returned from secrets file

        var oReq = new XMLHttpRequest(); // New request object

        oReq.onload = function() {
            // This is where you handle what to do with the response.
            // The actual data is found on this.responseText

            // Test to see if secrets file returns JSON - it will not if not logged in with UserSpice
            if( githubassetfetcher.prototype.isJSON(this.responseText) ) {
                githubassetfetcher.prototype.valid = true;
                githubassetfetcher.prototype.repoText = this.responseText;

            } else {
                console.log( oReq.statusText );     // Report error from GitHub
            }
        }
        
        oReq.open("get", us_url_root+"core/githubassetfetch.php?repo="+repo+"&user="+user, false);          // TODO Add authentication to fetcher
        oReq.send();
    }

    /** Get value of particular variable 
     * @param str          String containing name of variable
     */
    getLatestRelease() {
        if( this.valid )
        {
            var repoJSON = JSON.parse(this.repoText);
            return repoJSON.releases[0];
        } else {
            return "";
        }
    }

    /** Test to see if string is a JSON structure 
     * @param str          String containing path of secrets file to load
     */
    isJSON(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
} 