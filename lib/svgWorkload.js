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

Produce Workload SVG components

*/


//----------------------------------------------------------
// public vars
//----------------------------------------------------------
var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
var vol = require('../lib/svgVolume');

//------------------------------------------------------------------------------
// parse the container  
//------------------------------------------------------------------------------
var parseContainer = function(ns, kind, name, obj, src, part, ctype) {
    var doit = true;
    var e = -1;
    var c_name = '';
    var c_tmp;
    var c_h;
    var c_y;
    var cdata = [];

    var vloop = true;
    var v = 0;
    var vdata = [];
    var v_tmp;
    var v_mountName;

    var ploop;
    var p = 0;
    var p_tmp;
    var rpdata = [];

    //var fld = getFileId(src);
    try {
        while (doit) {
            c_name = '';
            c_tmp;
            c_h = 0;
            //increment Y and save the starting value for this container

            e++;
            if (typeof obj[e] !== 'undefined') {
                vpk.yBASE = vpk.yBASE + 30;
                c_y = vpk.yBASE;

                // parse container definition
                c_name = obj[e].name;
                // set container type
                if (ctype === 'I') {
                    kind = 'InitContainer';
                } else {
                    kind = 'Container';
                }


                // check for args
                if (typeof obj[e].args !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'Args', ns, 'args', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for command
                if (typeof obj[e].command !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'Command', ns, 'command', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for env
                if (typeof obj[e].env !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'Env', ns, 'env', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for readinessProbe
                if (typeof obj[e].readinessProbe !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'ReadinessProbe', ns, 'readinessProbe', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for livenessProbe
                if (typeof obj[e].livenessProbe !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'LivenessProbe', ns, 'livenessProbe', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for NodeSelector
                if (typeof obj[e].nodeSelector !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'NodeSelector', ns, 'nodeSelector', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for lifecycle
                if (typeof obj[e].lifecycle !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    v_tmp = utl.bldEntry('entry', 'Lifecycle', ns, 'lifecycle', src, part, 90, vpk.yBASE, 30, 90, 'id');
                    rpdata.push(v_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }


                // check for ports
                if (typeof obj[e].ports !== 'undefined') {
                    ploop = true;
                    p = 0;

                    // determine if done
                    if (typeof obj[e].ports[p] == 'undefined') {
                        ploop = false;
                    }

                    // build  configMap, secret, and fieldRef entries if they exist
                    while (ploop) {

                        if (typeof obj[e].ports[p].containerPort !== 'undefined') {
                            vpk.yBASE = vpk.yBASE + 30;
                            p_tmp = utl.bldEntry('entry', 'ContainerPort', ns, obj[e].ports[p].containerPort, src, part, 90, vpk.yBASE, 30, 90, 'id');
                            rpdata.push(p_tmp);
                            vpk.yBASE = vpk.yBASE + 30;
                        }
                        p++;
                        if (typeof obj[e].ports[p] === 'undefined') {
                            ploop = false;
                        }
                    }
                }

                // check for volumeMounts
                if (typeof obj[e].volumeMounts !== 'undefined') {
                    vloop = true;
                    v = 0;
                    vdata = [];
                    v_tmp;

                    // determine if done
                    if (typeof obj[e].volumeMounts[v] == 'undefined') {
                        vloop = false;
                    }

                    // build  configMap, secret, and fieldRef entries if they exist
                    while (vloop) {

                        v_mountName = '';
                        if (typeof obj[e].volumeMounts[v].name !== 'undefined') {
                            vpk.yBASE = vpk.yBASE + 30;
                            v_mountName = obj[e].volumeMounts[v].name + ' :: mountPath = ' + obj[e].volumeMounts[v].mountPath;
                            v_tmp = utl.bldEntry('entry', 'VolumeMount', ns, v_mountName, src, part, 90, vpk.yBASE, 30, 90, 'id');
                            vdata.push(v_tmp);

                            // search vpk.mntVols for matching Volumes entry
                            var vNum;
                            if (typeof vpk.mntVol[obj[e].volumeMounts[v].name] !== 'undefined') {
                                vNum = vpk.mntVol[obj[e].volumeMounts[v].name];
                            } else {
                                vNum = '?';
                            }

                            var cY = vpk.yBASE + 15;
                            v_tmp = utl.bldEntry('circle', 'VolLink', ns, vpk.mntCnt, src, part, 195, cY, 12, 0, 'id');
                            vdata.push(v_tmp);

                            cY = cY + 5;
                            v_tmp = utl.bldEntry('text', 'VolNumber', ns, vNum, src, part, 192, cY, 0, 0, 'id');
                            vdata.push(v_tmp);

                            vpk.yBASE = vpk.yBASE + 30;
                        }
                        v++;
                        if (typeof obj[e].volumeMounts[v] === 'undefined') {
                            vloop = false;
                        }
                    }
                }

                // create container entry
                vpk.yBASE = vpk.yBASE + 30;
                c_h = vpk.yBASE - c_y;
                c_tmp = utl.bldEntry('entry', kind, ns, c_name, src, part, 60, c_y, c_h, 150, 'id');
                cdata.push(c_tmp);

                utl.combineData(cdata, vdata);
                utl.combineData(cdata, rpdata);

            } else {
                doit = false;
            }

            // safety stop
            if (e > 999) {
                doit = false;
            }
        }
    } catch (err) {
        utl.logMsg('vpkSV201 - Error processing file: ' + src + 'part: ' + part + ' message: ' + err, 'svgWorkload');
    }
    return cdata;
};



//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------

module.exports = {

    getWorkload: function(ns, kind, name, src, part) {
        var obj;
        var key;
        var w_data;
        var r_data = [];

        try {
            key = src + '::' + part;
            // get yaml from saved fileContents
            obj = vpk.fileContent[key];

            // clear vars
            vpk.mntVol = [];
            vpk.mntCnt = 0;

			if (typeof obj[0].content !== 'undefined') {
				if (typeof obj[0].content.spec !== 'undefined') {
			
            		if (typeof obj[0].content.spec.tolerations !== 'undefined') {
                		vpk.yBASE = vpk.yBASE + 30;
                		var t_data = [];
                		t_data.push(utl.bldEntry('entry', 'Tolerations', ns, 'tolerations', src, part, 60, vpk.yBASE, 30, 150, 'id'));
                		r_data = utl.combineData(r_data, t_data);
                		vpk.yBASE = vpk.yBASE + 30;
            		}

            		if (typeof obj[0].content.spec.nodeSelector !== 'undefined') {
                		vpk.yBASE = vpk.yBASE + 30;
                		var ns_data = [];
                		ns_data.push(utl.bldEntry('entry', 'NodeSelector', ns, 'nodeSelector', src, part, 60, vpk.yBASE, 30, 150, 'id'));
                		r_data = utl.combineData(r_data, ns_data);
                		vpk.yBASE = vpk.yBASE + 30;
            		}


            		if (typeof obj[0].content.spec.volumes !== 'undefined') {
                		w_data = vol.parseVolumes(ns, kind, name, obj[0].content.spec.volumes, src, part);
                		r_data = utl.combineData(r_data, w_data);
            		}

            		if (typeof obj[0].content.spec.volumeClaimTemplates !== 'undefined') {
                		w_data = vol.parseVolumeTemplates(ns, kind, name, obj[0].content.spec.volumeClaimTemplates, src, part);
                		r_data = utl.combineData(r_data, w_data);
            		}

            		if (typeof obj[0].content.spec.containers !== 'undefined') {
                		w_data = parseContainer(ns, kind, name, obj[0].content.spec.containers, src, part, 'C');
                		r_data = utl.combineData(r_data, w_data);
            		}

            		if (typeof obj[0].content.spec.initContainers !== 'undefined') {
                		w_data = parseContainer(ns, kind, name, obj[0].content.spec.initContainers, src, part, 'I');
                		r_data = utl.combineData(r_data, w_data);
            		}

				}
			}

			if (typeof obj[0].content.spec.template !== 'undefined') {
				if (typeof obj[0].content.spec.template.spec !== 'undefined') {
			
            		if (typeof obj[0].content.spec.template.spec.tolerations !== 'undefined') {
                		vpk.yBASE = vpk.yBASE + 30;
                		var t_data = [];
                		t_data.push(utl.bldEntry('entry', 'Tolerations', ns, 'tolerations', src, part, 60, vpk.yBASE, 30, 150, 'id'));
                		r_data = utl.combineData(r_data, t_data);
                		vpk.yBASE = vpk.yBASE + 30;
            		}

            		if (typeof obj[0].content.spec.template.spec.nodeSelector !== 'undefined') {
                		vpk.yBASE = vpk.yBASE + 30;
                		var ns_data = [];
                		ns_data.push(utl.bldEntry('entry', 'NodeSelector', ns, 'nodeSelector', src, part, 60, vpk.yBASE, 30, 150, 'id'));
                		r_data = utl.combineData(r_data, ns_data);
                		vpk.yBASE = vpk.yBASE + 30;
            		}


            		if (typeof obj[0].content.spec.template.spec.volumes !== 'undefined') {
                		w_data = vol.parseVolumes(ns, kind, name, obj[0].content.spec.template.spec.volumes, src, part);
                		r_data = utl.combineData(r_data, w_data);
            		}

            		if (typeof obj[0].content.spec.volumeClaimTemplates !== 'undefined') {
                		w_data = vol.parseVolumeTemplates(ns, kind, name, obj[0].content.spec.volumeClaimTemplates, src, part);
                		r_data = utl.combineData(r_data, w_data);
            		}

            		if (typeof obj[0].content.spec.template.spec.containers !== 'undefined') {
                		w_data = parseContainer(ns, kind, name, obj[0].content.spec.template.spec.containers, src, part, 'C');
                		r_data = utl.combineData(r_data, w_data);
            		}

            		if (typeof obj[0].content.spec.template.spec.initContainers !== 'undefined') {
                		w_data = parseContainer(ns, kind, name, obj[0].content.spec.template.spec.initContainers, src, part, 'I');
                		r_data = utl.combineData(r_data, w_data);
            		}

				}
			}



        } catch (err) {
            utl.logMsg('vpkSV101 - Error processing getObject, message: ' + err, 'svgWorkload');
        }
        return r_data;
    }
    // end of module    
};