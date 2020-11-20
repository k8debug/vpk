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

Produce multiple SVG components

*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
var wrk = require('../lib/svgWorkload');
var pv = require('../lib/svgPersistentVolume');
var ing = require('../lib/svgIngress');

//----------------------------------------------------------
// public vars
//----------------------------------------------------------
// init for each namespace
vpk.yBASE = 0;

// init only once
var rtnData = []; // the data to be returned
var currNS = ' '; // namespace value
vpk.mntVol = [];
vpk.mntCnt = 0;

//------------------------------------------------------------------------------
// initialize 
//------------------------------------------------------------------------------
var initialize = function() {
    vpk.yBASE = 0;
    vpk.mntVol = [];
    vpk.mntCnt = 0;
};

//------------------------------------------------------------------------------
// Loop through request(s)
//------------------------------------------------------------------------------
var loopRequests = function(data) {
    var gbldata;

    if (data.length > 0) {
        data.sort();
        for (var s = 0; s < data.length; s++) {
            // pass the entry for processing
            gbldata = checkNamespace(data[s]);
            rtnData = utl.combineData(rtnData, gbldata);
        }

        // Last record processing, add ending namespace entry 
        gbldata = utl.bldEntry('endNamespace', 'kind', 'ns', 'name', 'src', 'part', 0, vpk.yBASE, 0, 0, 'id', 'key');
        rtnData.push(gbldata);

    }
};


//------------------------------------------------------------------------------
// Level 1 - Namespace will be used t create a new set of <svg> </svg> tags in html 
//------------------------------------------------------------------------------
var checkNamespace = function(data) {
    if (data === null) {
        utl.logMsg('vpkSVD101 - Request item should not be blank, nothing will be returned', 'svgGenDrv');
        return [];
    }

    // split and parse request
    var parm = data.split('::');
    if (parm.length < 5) {
        utl.logMsg('vpkSVD102 - Invalid SVG request, does not contain 5 parameters, data: ' + data, 'svgGenDrv');
        return [];
    }
    var ns = parm[0];
    var kind = parm[1];
    var name = parm[2];
    var src = parm[3];
    var part = parm[4];

    var ns_data;
    var entry;

    // check if new namespace is different
    if (currNS !== ns) {
        // if first time skip writing the endNamespace entry
        if (currNS !== ' ') {
            vpk.yBASE = vpk.yBASE + 30;
            entry = utl.bldEntry('endNamespace', 'kind', 'ns', 'name', 'src', 'part', 0, vpk.yBASE, 0, 0, 'id', 'key');
            vpk.yBASE = vpk.yBASE + 30;

            rtnData.push(entry);
        }

        entry = utl.bldEntry('startNamespace', 'kind', ns, 'name', 'src', 'part', 0, 0, 0, 0, 'id', 'key');
        rtnData.push(entry);
        vpk.yBASE = vpk.yBASE + 30;

        currNS = parm[0];
        initialize();
    }

    ns_data = checkSearchKind(ns, kind, name, src, part);
    return ns_data;
};


var checkSearchKind = function(ns, kind, name, src, part) {

    vpk.yBASE = vpk.yBASE + 40;
    // write name above entry
    var entry = utl.bldEntry('text', kind, ns, name, 'src', 'part', 30, vpk.yBASE, 0, 0, 'id', 'key');
    rtnData.push(entry);

    var k_data = [];
    vpk.yBASE = vpk.yBASE + 5;
    var k_y = vpk.yBASE;
    var k_w = 90;
    var k_h;


    switch (kind) {
        case 'APIService':
            break;
        case 'Args':
            break;
        case 'CertificateSigningRequest':
        	break;
        case 'Command':
            break;
        case 'ConfigMap':
            break;
        case 'ComponentStatus':
            break;
        case 'Container':
            break;
        case 'ContainerImage':
            break;
        case 'ContainerName':
            break;
		case 'CustomResourceDefinition':
			break;
        case 'ClusterRole':
            break;
        case 'ClusterRoleBinding':
            break;
        case 'CronJob':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'DaemonSet':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'Deployment':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'DeploymentConfig':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'Endpoints':
            break;
        case 'Env':
            break;
        case 'Ingress':
            k_data = ing.getIngress(ns, kind, name, src, part);
            k_w = 150;
            break;
        case 'Job':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'Labels':
            break;
        case 'LabelsSpecTemplate':
            break;
        case 'LabelsSpecSelector':
            break;
        case 'LivenessProbe':
            break;
        case 'List':
            break;
        case 'Namespace':
            break;
        case 'NetworkPolicy':
            break;
        case 'NodeSelector':
            break;
        case 'PersistentVolume':
            k_data = pv.getPV(ns, kind, name, src, part);
            k_w = 150;
            break;
        case 'PersistentVolumeClaim':
            break;
        case 'PodDisruptionBudget':
            break;
        case 'PodPreset':
            break;
        case 'PodSecurityPolicy':
            break;
        case 'Pod':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'PriorityClass':
            break;
        case 'PriorityClass':
            break;
        case 'ReadinessProbe':
            break;
        case 'ReplicaSet':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'ReplicationController':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'ResourceQuota':
            break;
        case 'Role':
            break;
        case 'RoleBinding':
            break;
        case 'Secret':
            break;
        case 'SecretUse':
            break;
        case 'Service':
            k_data = getService(ns, kind, name, src, part);
            k_w = 150;
            break;
        case 'ServiceAccount':
            break;
        case 'StatefulSet':
            k_data = wrk.getWorkload(ns, kind, name, src, part);
            k_w = 210;
            break;
        case 'StorageClass':
            break;
        case 'TokenReview':
            break;
        case 'Volume':
            break;
        case 'VolumeAttachment':
            break;
        case 'VolumeClaimTemplates':
            break;
        case 'VolumeMounts':
            break;
        default:
            utl.logMsg('vpkSVD103 - Unknown kind: ' + kind, 'svgGenDrv');
    }

    vpk.yBASE = vpk.yBASE + 30;
    k_h = vpk.yBASE;

    k_h = k_h - k_y;


    // create the kind entry
    var k_entry = [];
    //var item = utl.bldEntry('entry', kind, ns, name, src, part, 30, k_y, k_h, k_w, 'id');

	var item;
    switch (kind) {
        case 'Args':
	    	item = utl.bldEntry('entry', kind, ns, 'args', src, part, 30, k_y, k_h, k_w, 'id');
			break;
        case 'Command':
	    	item = utl.bldEntry('entry', kind, ns, 'command', src, part, 30, k_y, k_h, k_w, 'id');
			break;
        case 'Env':
	    	item = utl.bldEntry('entry', kind, ns, 'env', src, part, 30, k_y, k_h, k_w, 'id');
			break;
        case 'LivenessProbe':
	    	item = utl.bldEntry('entry', kind, ns, 'livenessProbe', src, part, 30, k_y, k_h, k_w, 'id');
			break;
        case 'ReadinessProbe':
	    	item = utl.bldEntry('entry', kind, ns, 'readinessProbe', src, part, 30, k_y, k_h, k_w, 'id');
			break;
        default:
		    item = utl.bldEntry('entry', kind, ns, name, src, part, 30, k_y, k_h, k_w, 'id');
    }



    var xRefY = k_y;
    k_entry.push(item);

    vpk.yBASE = vpk.yBASE + 30;
    // add k_data if it exists
    var r_data = utl.combineData(k_entry, k_data);

    // cross ref entries
    var xkey = ns + '.' + name;
    var rtn = ' ';
    var obj;
    var parts;
    switch (kind) {
        case 'ConfigMap':
            if (typeof vpk['ConfigMapUse'][xkey] !== 'undefined') {
                obj = vpk['ConfigMapUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'ContainerImage':
            if (typeof vpk['ContainerImageUse'][xkey] !== 'undefined') {
                obj = vpk['ContainerImageUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'Labels':
            parts = name.split(' = ');
            xkey = ns + '.' + parts[0] + '.' + parts[1];
            if (typeof vpk['LabelsUse'][xkey] !== 'undefined') {
                obj = vpk['LabelsUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'NodeSelector':
            parts = name.split(' = ');
            xkey = ns + '.' + parts[0] + '.' + parts[1];
            if (typeof vpk['NodeSelectorUse'][xkey] !== 'undefined') {
                obj = vpk['NodeSelectorUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'Secret':
            if (typeof vpk['SecretsUse'][xkey] !== 'undefined') {
                obj = vpk['SecretsUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'Selector':
            parts = name.split(' = ');
            xkey = ns + '.' + parts[0] + '.' + parts[1];
            if (typeof vpk['LabelsUse'][xkey] !== 'undefined') {
                obj = vpk['LabelsUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'StorageClass':
            if (typeof vpk['StorageClassUse'][xkey] !== 'undefined') {
                obj = vpk['StorageClassUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'Volume':
            if (typeof vpk['VolumesUse'][xkey] !== 'undefined') {
                obj = vpk['VolumesUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'VolumeClaimTemplates':
            if (typeof vpk['VolumeClaimTemplatesUse'][xkey] !== 'undefined') {
                obj = vpk['VolumeClaimTemplatesUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;
        case 'VolumeMounts':
            if (typeof vpk['VolumeMountsUse'][xkey] !== 'undefined') {
                obj = vpk['VolumeMountsUse'][xkey];
                rtn = getXref(xRefY, obj, name);
            }
            break;

        default:
            //No xRef processing;
    }

    // if xref data exists add it to r_data;
    if (rtn !== ' ') {
        var x_data = rtn.data;
        var nyB = rtn.nyB;
        if (nyB > vpk.yBASE) {
            vpk.yBASE = nyB + 30;
        }
        r_data = utl.combineData(r_data, x_data);
    }

    return r_data;
};


//------------------------------------------------------------------------------
// process data for xref  
//------------------------------------------------------------------------------
var getXref = function(yb, data, xname) {

    // sort array to be processed
    var obj = data.sort(arraySort('sourceFile'));
    // get the first sourceFile
    var currSrc = obj[0].sourceFile;
    

    var x_data = [];
    var b_data = [];
    
    var x = -1;
    var nyB = yb;
    var x_tmp;
    var x_ty;
    
    var lineStartX = 120;
    var lineStartY = nyB + 15;
    var lineStopY;
    
    // file boundary data
    var fY = yb - 25;
    
    try {
        for (x in obj) {
            if (typeof obj[x] !== 'undefined') {
                
                if (obj[x].sourceFile !== currSrc) {
                    if (x !== 0) {
                        b_data = buildBracket(currSrc, fY, nyB);
                        x_data = utl.combineData(b_data, x_data);
                    } 
                    
                    currSrc = obj[x].sourceFile;                
                    nyB = nyB + 30;
                    fY = nyB;
//                    x_data = utl.combineData(b_data, x_data);
                }
                
                    
                // process entry    
                if (x > 0) {
                    nyB = nyB + 30;
                }
                x_ty = nyB - 5;
                x_tmp = utl.bldEntry('text', obj[x].objName, obj[x].namespace, obj[x].objName, obj[x].sourceFile, obj[x].sourcePart, 360, x_ty, 0, 0, 'id');
                x_data.push(x_tmp);

/*
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

*/

                x_tmp = utl.bldEntry('entry', obj[x].kind , obj[x].namespace, xname + ' :: ' + obj[x].objName, obj[x].sourceFile, obj[x].sourcePart, 360, nyB, 30, 90, 'id');
                x_data.push(x_tmp);
                
                lineStopY = nyB + 15;
                x_tmp = utl.bldEntry('line', 'Line', ' ', ' ', ' ', ' ', lineStartX, lineStartY, 360, lineStopY, 'id');           
                x_data.push(x_tmp);
                nyB = nyB + 30;
            }
        }

        b_data = buildBracket(currSrc, fY, nyB);                    
        x_data = utl.combineData(b_data, x_data);

    } catch (err) {
        utl.logMsg('vpkSVD104 - Error processing xref, message: ' + err, 'svgGenDrv');
    }

    return {
        'data': x_data,
        'nyB': nyB
    };
};

var arraySort = function(property) {
    var sortOrder = 1;
    if(property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
};

var buildBracket = function(src, fY, nyB) {
    var b_data = [];
    var b_tmp;
    nyB = nyB + 5;
    var hl;

    // write file name
    b_tmp = utl.bldEntry('text', 'SourceFile', src, 'File: ' + src, src, 0, 345, fY, 0, 0, 'id');
    b_data.push(b_tmp);
        
    // write box
    hl = nyB - fY;
    fY = fY + 5;
    b_tmp = utl.bldEntry('boundary', 'SourceFile', 'NS', src, src, 0, 345, fY, hl, 300, 'id');
    b_data.push(b_tmp);

    return b_data;
};


//------------------------------------------------------------------------------
// get yaml data for item  
//------------------------------------------------------------------------------
var getService = function(ns, kind, name, src, part) {

    var obj;
    var key;
    var p_data = [];
    var ploop;
    var p_tmp;
    var result;
    var p;

    try {
        key = ns + '.' + kind + '.' + name;
        obj = vpk.Service[key];

        // check for ports
        if (typeof obj[0].ports !== 'undefined') {
            ploop = true;
            p = 0;

            // determine if done
            if (typeof obj[0].ports[p] == 'undefined') {
                ploop = false;
            }

            // build  configMap, secret, and fieldRef entries if they exist
            while (ploop) {

                //bldEntry: function(evt, kind, ns, name, src, part, x, y, h, w, id)
                if (typeof obj[0].ports[p].port !== 'undefined') {
                    vpk.yBASE = vpk.yBASE + 30;
                    p_tmp = utl.bldEntry('entry', 'ServicePort', ns, obj[0].ports[p].port, src, part, 60, vpk.yBASE, 30, 90, 'id');
                    p_data.push(p_tmp);
                    vpk.yBASE = vpk.yBASE + 30;
                }

                p++;
                if (typeof obj[0].ports[p] === 'undefined') {
                    ploop = false;
                }
            }
        }

        result = p_data;

    } catch (err) {
        utl.logMsg('vpkSVD105 - Error processing service, message: ' + err, 'svgGenDrv');
    }

    return result;
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    build: function(data) {
        try{
            initialize();
            rtnData = [];
            currNS = ' ';
            loopRequests(data);
            return rtnData;
        } catch (err) {
            utl.logMsg('vpkSVD099 - Error processing request, message: ' + err);
            utl.logMsg('vpkSVD199 - Call stack: ' + err.stack);
        }

    }

};