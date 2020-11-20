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

Produce Ingress SVG component

*/
//----------------------------------------------------------
// public vars
//----------------------------------------------------------
var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// parse the volumes 
//------------------------------------------------------------------------------
var parseIngress = function(ns, kind, name, obj, src, part) {
    var v_tmp;
    var vdata = [];
    var cdata = [];
    var result;
    var i;

    try {

        v_tmp;

        if (typeof obj !== 'undefined') {
            vpk.yBASE = vpk.yBASE + 30;


            if (typeof obj.spec.rules !== 'undefined') {
                for (i in obj.spec.rules) {
                    if (typeof obj.spec.rules[i].http !== 'undefined') {
                        if (typeof obj.spec.rules[i].http.paths !== 'undefined') {
                            var hl = obj.spec.rules[i].http.paths.length;
                            var yL;
                            for (var a = 0; a < hl; a++) {
                                v_tmp = utl.bldEntry('entry', 'Path', ns, obj.spec.rules[i].http.paths[a].path, src, part, 60, vpk.yBASE, 30, 90, 'id');
                                vdata.push(v_tmp);
                                if (typeof obj.spec.rules[i].http.paths[a] !== 'undefined') {
                                    if (typeof obj.spec.rules[i].http.paths[a].backend !== 'undefined') {
                                        if (typeof obj.spec.rules[i].http.paths[a].backend.serviceName !== 'undefined') {
                                            v_tmp = utl.bldEntry('entry', 'Service', ns, obj.spec.rules[i].http.paths[a].backend.serviceName, src, part, 210, vpk.yBASE, 30, 90, 'id');
                                            vdata.push(v_tmp);
                                            yL = vpk.yBASE + 15;
                                            v_tmp = utl.bldEntry('line', 'Line', ns, 'Line', src, part, 150, yL, 210, yL, 'id');
                                            vdata.push(v_tmp);
                                            vpk.yBASE = vpk.yBASE + 30;
                                        }
                                    }
                                }
                                vpk.yBASE = vpk.yBASE + 30;
                            }
                        }
                    }
                }
            }

            result = utl.combineData(cdata, vdata);
            vpk.yBASE = vpk.yBASE - 30;
        }

    } catch (err) {
        utl.logMsg('vpkSVI002 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'svgIngress');
    }
    return result;
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    getIngress: function(ns, kind, name, src, part) {
        var obj;
        var key;
        var v_data;

        try {
            key = src + '::' + part;
            // get yaml from saved fileContents
            obj = vpk.fileContent[key];

            if (typeof obj[0].content !== 'undefined') {
                v_data = parseIngress(ns, kind, name, obj[0].content, src, part);
            }

        } catch (err) {
            utl.logMsg('vpkSVI001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'svgIngress');
        }
        return v_data;
    }
    // end of module    
};