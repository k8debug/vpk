/*
Copyright 2018-2020 David A. Weilert

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

User defined component

*/


var vpk = require('./vpk');
var utl = require('./utl');
var hierarchy = require('./hierarchy');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseVolume = function(ns, kind, name, obj, rCnt, src, part, yk, fnum) {
    var doit = true;
    var e = -1;
    var v_name = '';
    var tmp;
    var item;
    var vkey;
    var podPVCClaimName = '';
    var configMapName = '';
    var secretName = '';



    try {
        while (doit) {
            v_name = '';

            e++;
            if (typeof obj[e] !== 'undefined') {
                v_name = obj[e].name;

                // check for pvc ref
                if (typeof obj[e].persistentVolumeClaim !== 'undefined') {
                    // checking the Pod to determine if there are PVC references
                    if (typeof obj[e].persistentVolumeClaim.claimName !== 'undefined') {
                        podPVCClaimName = obj[e].persistentVolumeClaim.claimName;
                    } else {
                        podPVCClaimName = '';
                    }
                } else {
                    podPVCClaimName = '';
                }

                if (typeof obj[e].configMap !== 'undefined') {
                    if (typeof obj[e].configMap.name !== 'undefined') {
                        // save info in use array
                        var cfkey = ns + '.' + obj[e].configMap.name;
                        utl.checkType('ConfigMapUse', cfkey);
                        var ctmp = vpk['ConfigMapUse'][cfkey];
                        var cUse = {
                            'namespace': ns,
                            'kind': kind,
                            'objName': name,
                            'configMap': obj[e].configMap.name,
                            'key': '',
                            'sourceFile': src,
                            'sourcePart': part
                        };
                        ctmp.push(cUse);

                        // add the information to cluster hierarchy
                        hierarchy.addEntry(ns, yk, name, src, part, 'Volume', v_name, 'ConfigMap', obj[e].configMap.name )
                        //utl.containerLink(fnum, 'ConfigMap', 'key', obj[e].configMap.name, 'Volume')

                        vpk['ConfigMapUse'][cfkey] = ctmp;
                        utl.checkKind('ConfigMapUse','U');
                        utl.countKind('ConfigMapUse');
                        configMapName = obj[e].configMap.name;
                    } else {
                        configMapName = '';
                    }
                } else {
                    configMapName = '';
                }
                
                if (typeof obj[e].secret !== 'undefined') {
                    if (typeof obj[e].secret.secretName !== 'undefined') {
                        // save info in use array
                        var seckey = ns + '.' + obj[e].secret.secretName;
                        utl.checkType('SecretsUse', seckey);
                        var stmp = vpk['SecretsUse'][seckey];
                        var sUse = {
                            'namespace': ns,
                            'kind': kind,
                            'objName': name,
                            'secret': obj[e].secret.secretName,
                            'key': '',
                            'sourceFile': src,
                            'sourcePart': part
                        };
                        stmp.push(sUse);

                        // add the information to cluster hierarchy
                        hierarchy.addEntry(ns, yk, name, src, part, 'Volume', v_name, 'Secret', obj[e].secret.secretName )
                        //utl.containerLink(fnum, 'Secret', 'key', obj[e].secret.secretName, 'Volume')

                        vpk['SecretsUse'][seckey] = stmp;
                        utl.checkKind('SecretsUse','U');
                        utl.countKind('SecretsUse');
                        secretName = obj[e].secret.secretName;
                    } else {
                        secretName = '';
                    }
                } else {
                    secretName = '';
                }

                vkey = ns + '.' + kind + '.' + v_name;
                utl.checkType('Volumes', '');
                if (typeof vpk['Volumes'][vkey] === 'undefined') {
                    vpk['Volumes'][vkey] = [];
                    tmp = vpk['Volumes'][vkey];
                    item = {
                        'namespace': ns,
                        'kind': kind,
                        'objName': v_name,
                        'sourceFile': src,
                        'sourcePart': part
                    };
                    tmp.push(item);

                    // add the information to cluster hierarchy
                    hierarchy.addEntry(ns, yk, name, src, part, 'Volume', v_name )
                    utl.containerLink(fnum, 'Volume', 'key', v_name)

                    
                    vpk['Volumes'][vkey] = tmp;
                    utl.checkKind('Volumes','U');
                    utl.countKind('Volumes');
                }


                vkey = ns + '.' + v_name;
                utl.checkType('VolumesUse', vkey);
                tmp = vpk['VolumesUse'][vkey];
                item = {
                    'namespace': ns,
                    'kind': yk,
                    'objName': name,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                vpk['VolumesUse'][vkey] = tmp;
                utl.checkKind('VolumesUse','U');
                utl.countKind('VolumesUse');

                // update container PVCs
                if (podPVCClaimName !== '') {
                    if (typeof vpk.containers[fnum]['PersistentVolumeClaim'] === 'undefined') {
                        vpk.containers[fnum]['PersistentVolumeClaim'] = [];
                    }
                    // add the pvcRef to the container
                    vpk.containers[fnum]['PersistentVolumeClaim'].push({
                        'name': obj[e].name, 
                        'podPVCClaimName': podPVCClaimName,
                        'configMapName': configMapName,
                        'secretName': secretName
                    });
                }

                // update container ConfigMap
                if (configMapName !== '') {
                    if (typeof vpk.containers[fnum]['ConfigMap'] === 'undefined') {
                        vpk.containers[fnum]['ConfigMap'] = [];
                    }
                    // add the pvcRef to the container
                    vpk.containers[fnum]['ConfigMap'].push({
                        'name': configMapName, 
                        'use': 'Volume'
                    });
                }

                // update container Secret
                if (secretName !== '') {
                    if (typeof vpk.containers[fnum]['Secret'] === 'undefined') {
                        vpk.containers[fnum]['Secret'] = [];
                    }
                    // add the pvcRef to the container
                    vpk.containers[fnum]['Secret'].push({
                        'name': secretName, 
                        'use': 'Volume'
                    });
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
        utl.logMsg('vpkVLP001 - Error processing file: ' + src + ' part: ' + part + '  message: ' + err);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // get started and check if any directories to process
    //------------------------------------------------------------------------------
    parse: function(ns, kind, name, obj, rCnt, src, part, yk, fnum) {

        parseVolume(ns, kind, name, obj, rCnt, src, part, yk, fnum);

    }

};