/*
Copyright 2018 Dave Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*

*/

//----------------------------------------------------------
// format server returned object definition file 
//----------------------------------------------------------
function objectDef(data) {
    //console.log(JSON.stringify(data, null, 4));
    var part = data.filePart;
    var defkey = data.defkey;
    defkey = defkey.trim();
    if (defkey.indexOf('::') > -1 ){
        var parts = defkey.split('::');
        defkey = parts[0].trim();
    }
    
    if (defkey.indexOf(' --') > -1 ){
        var parts = defkey.split(' ');
        defkey = parts[0].trim();
    }
    
    console.log('Original key: ' + data.defkey + ' New key: ' + defkey);
    
    // get file part and convert to integer
    part = parseInt(part);
    part++;
    
    var rtn = data.lines;
    var newData = rtn.split('\n');
    var hl = newData.length;
    var htm = '';
    var prefix = '';
    var nbsp = '';
    var rightSide = '';
    var leftSide = '';

    for (var h = 0; h < hl; h++) {
        nbsp = '';
        // if first entry set the header
        if (h === 0) {
            $("#defTitle").empty();
            $("#defTitle").html('');
            var hdr = newData[h];
            if (hdr.startsWith('- sourceFile: >-') ) {
                h++; 
                hdr = 'SourceFile: ' + newData[h];
            }           
            if (hdr.startsWith('- s') ) {
                hdr = 'S' + hdr.substr(3);
            }
            hdr = hdr.trim();
            $("#defTitle").html(hdr);
            if (part > 1) {
                $("#defPart").empty();
                $("#defPart").html('');
                $("#defPart").html('Multi-definition file, part: ' + part);
            } else {
                $("#defPart").empty();
                $("#defPart").html('');
            }
            
            h = h + 3;
        }
        
        
        
        if (newData[h].substr(0, 1) === ' ') {
            prefix = findSpaces(newData[h]);
            //console.log('Line: ' + h + 1 + ' has ' + prefix + ' leading spaces')
            if (prefix > 0) {
                for (var n = 0; n < prefix; n++) {
                    nbsp = nbsp + '&nbsp;'
                }
            }
        }

        // search line for value and high-light if value found
        var outStr = newData[h];
        var picked = false;
        
        if (defkey.indexOf(' = ') > -1 ){
            var lp = defkey.split(' = ');
            rightSide = lp[1];
            leftSide = lp[0];
            if (outStr.indexOf(lp[0]) > -1) {
                if (outStr.indexOf(lp[1]) > -1) {
                    outStr = '<span style="color: white; background-color: green;">' + outStr + '</span>';
                    picked = true;
                }
            }           
        }
        
        if (defkey === 'readinessProbe' || defkey === 'tolerations' || defkey === 'livenessProbe'  || defkey === 'lifecycle' || defkey === 'nodeSelector'
         || defkey === 'args' || defkey === 'command' || defkey === 'env' ) {
            
            //append colon
            defkey = defkey + ':'
        }
        
        if (!picked) {
            if (outStr.endsWith(defkey) ) {
                var kl = defkey.length;
                var sl = outStr.length;
                var p = sl - kl
                var cv = outStr.substring(p - 1, p);
                var sq = "'";
                if (cv === ' ' || cv === sq || cv === '"') {
                    outStr = '<span style="color: white; background-color: green;">' + outStr + '</span>';
                }
            }
        }

        if (!picked) {
            if (outStr.endsWith(defkey + "'") ) {
                var kl = defkey.length;
                kl = kl + 1
                var sl = outStr.length;
                var p = sl - kl
                var cv = outStr.substring(p - 1, p);
                var sq = "'";
                if (cv === ' ' || cv === sq || cv === '"') {
                    outStr = '<span style="color: white; background-color: green;">' + outStr + '</span>';
                }
            }
        }

        if (rightSide.length > 0) {
            if (outStr.endsWith(leftSide + ":" + ' ' + '\'' + rightSide + '\'') ) {
                outStr = '<span style="color: white; background-color: green;">' + outStr + '</span>';
            }
        }


        if (h === 0) {
            if (nbsp !== '') {
                htm = nbsp + outStr + '<br>';
            } else {
                htm = outStr + '<br>';
            }
        } else {
            if (nbsp != '') {
                htm = htm + nbsp + outStr + '<br>';
            } else {
                htm = htm + outStr + '<br>';
            }
        }
    }
    $("#defContents").empty();
    $("#defContents").html('');
    $("#defContents").html(htm);
    $("#defFileModal").modal();
}


// parse line for leading spaces and replace with html &nbsp;
function findSpaces(line) {
    var cnt = 1;
    var loop = true;
    var ptr = 0;
    var hl = line.length;
    while (loop === true) {
        ptr++;
        if (ptr + 1 < hl) {
            if (line.substr(ptr, 1) === ' ') {
                cnt++;
            } else {
                loop = false;
            }
        } else {
            loop = false;
        }
    }
    return cnt;
}

//----------------------------------------------------------
console.log('loaded vpkobjdef.js');