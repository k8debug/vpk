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

/*----------------------------------------------------------

Produce Persistent Volume SVG components

*/


//----------------------------------------------------------
// public vars
//----------------------------------------------------------
var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// parse the volumes 
//------------------------------------------------------------------------------
var parsePersistentVolume = function(ns, kind, name, obj, src, part) {
    var v_tmp;
    var vdata = [];
    var cdata = [];
    var result;

    try {

        v_tmp = '';

        if (typeof obj !== 'undefined') {
            vpk.yBASE = vpk.yBASE + 30;

            // check for access mode 
            if (typeof obj.spec.accessModes !== 'undefined') {
                var hl = obj.spec.accessModes.length;
                for (var a = 0; a < hl; a++) {
                    v_tmp = utl.bldEntry('entry', 'PV-Access', ns, obj.spec.accessModes[a], src, part, 60, vpk.yBASE, 30, 90, 'id');
                    vdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 60;
                }
            }

            // check for reclaim 
            if (typeof obj.spec.persistentVolumeReclaimPolicy !== 'undefined') {
                v_tmp = utl.bldEntry('entry', 'PV-Reclaim', ns, obj.spec.persistentVolumeReclaimPolicy, src, part, 60, vpk.yBASE, 30, 90, 'id');
                vdata.push(v_tmp);
                vpk.yBASE = vpk.yBASE + 60;
            }


            // check for storage class 
            if (typeof obj.spec.storageClassName !== 'undefined') {
                v_tmp = utl.bldEntry('entry', 'PV-StorClass', ns, obj.spec.storageClassName, src, part, 60, vpk.yBASE, 30, 90, 'id');
                vdata.push(v_tmp);
                vpk.yBASE = vpk.yBASE + 30;
            }

            result = utl.combineData(cdata, vdata);
        }

    } catch (err) {
        utl.logMsg('vpkSVV02 - Processing error file: ' + src + ' part: ' + part + ' message: ' + err, 'svgPersistentVolume');
    }
    return result;
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    getPV: function(ns, kind, name, src, part) {
        var obj;
        var key;
        var v_data;

        try {
            key = src + '::' + part;
            // get yaml from saved fileContents
            obj = vpk.fileContent[key];

            if (typeof obj[0].content !== 'undefined') {
                v_data = parsePersistentVolume(ns, kind, name, obj[0].content, src, part);
            }

        } catch (err) {
            utl.logMsg('vpkSVV01 - Processing error file: ' + src + ' part: ' + part + ' message: ' + err, 'svgPersistentVolume');
        }
        return v_data;
    }
    // end of module    
};