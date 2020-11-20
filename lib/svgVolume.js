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

Produce Volume SVG components

*/

//----------------------------------------------------------
// public vars
//----------------------------------------------------------
var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // parse the volumes 
    //------------------------------------------------------------------------------
    parseVolumes: function(ns, kind, name, obj, src, part) {
        var doit = true;
        var e = -1;
        var v_name = '';
        var v_configMapName = '';
        var v_secretName = '';
        var v_180;
        var v_tmp;
//        var v_h;
//        var v_y;
        var vdata = [];

        try {

            while (doit) {
                v_name = '';
                v_configMapName = '';
                v_secretName = '';
                v_tmp;
//                v_h = 0;
                v_180 = false;

                e++;
                if (typeof obj[e] !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
//                    v_y = vpk.yBASE;

                    // get the name of the volumes definition
                    v_name = obj[e].name;

                    // check for emptyDir 
                    if (typeof obj[e].emptyDir !== 'undefined') {
                        v_name = v_name + '  -- emptyDir -parms: {}';
                    }

                    // check for hostPath 
                    if (typeof obj[e].hostPath !== 'undefined') {
                        v_name = v_name + '  -- hostPath -parms: path = ' + obj[e].hostPath.path;
                    }

                    // check for nfs 
                    if (typeof obj[e].nfsPath !== 'undefined') {
                        v_name = v_name + '  -- nfs -parms: server = ' + obj[e].nfsPath.server + ' path = ' + obj[e].nfsPath.path;
                    }

                    // check for configMap 
                    if (typeof obj[e].configMap !== 'undefined') {
                        if (typeof obj[e].configMap.name !== 'undefined') {
                            v_configMapName = obj[e].configMap.name;
                        } else {
                            v_configMapName = 'configMap.name is missing';
                        }
                    }

                    // check for secret
                    if (typeof obj[e].secret !== 'undefined') {
                        if (typeof obj[e].secret.secretName !== 'undefined') {
                            v_secretName = obj[e].secret.secretName;
                        } else {
                            v_secretName = 'secret.secretName is missing';
                        }
                    }

                    v_tmp = utl.bldEntry('entry', 'Volume', ns, v_name, src, part, 60, vpk.yBASE, 30, 150, 'id');
                    vdata.push(v_tmp);

                    //save mount name so it can be linked with Volumes entry
                    vpk.mntCnt++;
                    vpk.mntVol.push(obj[e].name);
                    vpk.mntVol[obj[e].name] = vpk.mntCnt;

                    var cY = vpk.yBASE + 15;
                    v_tmp = utl.bldEntry('circle', 'VolLink', ns, vpk.mntCnt, src, part, 45, cY, 12, 0, 'id');
                    vdata.push(v_tmp);

                    cY = cY + 5;
                    v_tmp = utl.bldEntry('text', 'VolNumber', ns, vpk.mntCnt, src, part, 41, cY, 0, 0, 'id');
                    vdata.push(v_tmp);


                    var lineY;
                    if (v_configMapName !== '') {
                        v_tmp = utl.bldEntry('entry', 'ConfigMap', ns, v_configMapName, src, part, 270, vpk.yBASE, 30, 90, 'id');
                        vdata.push(v_tmp);

                        // draw line to connect
                        lineY = vpk.yBASE + 15;
                        v_tmp = utl.bldEntry('line', 'Line', ns, 'Using', src, part, 211, lineY, 270, lineY, 'id');
                        vdata.push(v_tmp);
                        v_180 = true;
                    }

        
                    if (v_secretName !== '') {
                        var nX1;

                        if (v_180) {
                            nX1 = 390;
                        } else {
                            nX1 = 270;
                        }
                        v_tmp = utl.bldEntry('entry', 'Secret', ns, v_secretName, src, part, nX1, vpk.yBASE, 30, 90, 'id');
                        vdata.push(v_tmp);

                        // draw line to connect
                        lineY = vpk.yBASE + 15;
                        v_tmp = utl.bldEntry('line', 'Line', ns, 'Using', src, part, 211, lineY, 270, lineY, 'id');
                        vdata.push(v_tmp);
                    }

                    vpk.yBASE = vpk.yBASE + 30;

                } else {
                    doit = false;
                }
            }

            // safety stop
            if (e > 1000) {
                doit = false;
            }

        } catch (err) {
            utl.logMsg('vpkSVV001 - Processing error, message: ' + err, 'svgVolume');
        }
        return vdata;
    },

    //------------------------------------------------------------------------------
    // parse the volumes 
    //------------------------------------------------------------------------------
    parseVolumeTemplates: function(ns, kind, name, obj, src, part) {
        var doit = true;
        var e = -1;
        var v_name = '';
        var v_tmp;
        var vdata = [];

        try {

            while (doit) {
                v_name = '';
                v_tmp;

                e++;
                if (typeof obj[e] !== 'undefined') {

                    // get the name of the volumes definition
                    v_name = obj[e].metadata.name;
                
                	// check if already defined before creating new entry
                	if (typeof vpk.mntVol[v_name] === 'undefined') {
                    	vpk.yBASE = vpk.yBASE + 30;


                    	v_tmp = utl.bldEntry('entry', 'VolumeClaimTemplates', ns, v_name, src, part, 60, vpk.yBASE, 30, 150, 'id');
                    	vdata.push(v_tmp);

                    	//save mount name so it can be linked with Volumes entry
                    	vpk.mntCnt++;
                    	vpk.mntVol.push(v_name);
                    	vpk.mntVol[v_name] = vpk.mntCnt;

                    	var cY = vpk.yBASE + 15;
                    	v_tmp = utl.bldEntry('circle', 'VolLink', ns, vpk.mntCnt, src, part, 45, cY, 12, 0, 'id');
                    	vdata.push(v_tmp);

                    	cY = cY + 5;
                    	v_tmp = utl.bldEntry('text', 'VolNumber', ns, vpk.mntCnt, src, part, 41, cY, 0, 0, 'id');
                    	vdata.push(v_tmp);

                    	vpk.yBASE = vpk.yBASE + 30;
                    }

                } else {
                    doit = false;
                }
            }

            // safety stop
            if (e > 1000) {
                doit = false;
            }

        } catch (err) {
            utl.logMsg('vpkSVV002 - Processing error, message: ' + err, 'svgVolume');
        }
        return vdata;
    }
// end of module
};