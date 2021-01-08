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

/*------------------------------------------------------------------------------
Component that reads, parses, and stores the yaml file information.
*/
'use strict';

// Requires
// var utl = require('./utl');

var vpk = require('./vpk'),
    containerParse = require('./parseContainer'),
    controllerRevisionParse = require('./parseControllerRevision'),
    CSIParse = require('./parseCSI'),
    crdParse = require('./parseCRD'),
    endpointsParse = require('./parseEndpoints'),
    endpointSliceParse = require('./parseEndpointSlice'),
    eventParse = require('./parseEvent'),
    genericParse = require('./parseGeneric'),
    hpaParse = require('./parseHPA'),
    nodeSelectorParse = require('./parseNodeSelector'),
    persistentVolumeParse = require('./parsePersistentVolume'),
    persistentVolumeClaimParse = require('./parsePersistentVolumeClaim'),
    roleBindingParse = require('./parseRoleBinding'),
    roleParse = require('./parseRole'),
    secretParse = require('./parseSecret'),
    serviceParse = require('./parseService'),
    serviceAccountParse = require('./parseServiceAccount'),
    storageClassParse = require('./parseStorageClass'),
    volumeParse = require('./parseVolume'),
    volumeClaimTemplatesParse = require('./parseVolumeClaimTemplate'),
    lbl = require('./labels'),
    utl = require('./utl'),
    fs = require('fs'),
    path = require('path'),
    xref = require('./xreference'),
    YAML = require('js-yaml');


var fnum;
var fp;
var oRef;
var cStatus;
var statusPhase = '';

//------------------------------------------------------------------------------
// read directory and populate file array 
//------------------------------------------------------------------------------
var readDIR = function(p) {
    vpk.baseFS = [];
    try {
        utl.logMsg('vpkFIO901 - Processing snapshot directory');

        //clear vpk
        delete vpk.hierarchy
        delete vpk.relMap
        vpk.hierarchy = {};
        vpk.relMap = '';

        vpk.baseFS = fs.readdirSync(p);
    } catch (err) {
        utl.logMsg('vpkFIO001 - Error - Reading directory, message: = ' + err );
        // clear the file array since there is an error and not able to process
        vpk.baseFS = [];
    }
};


//------------------------------------------------------------------------------
// loop through the results of the directory read
//------------------------------------------------------------------------------
var loopBaseFS = function() {
    vpk.childUids = [];

    var hl = vpk.baseFS.length; // number of files in file array
    var fn; // filename
    var rf; // real file not a directory

    for (var i = 0; i < hl; i++) {
        // build file name to process
        fn = path.join(vpk.dirname, vpk.baseFS[i]);

        // is this a file or a directory
        rf = fs.statSync(fn).isFile();

        if (rf) {
            vpk.fCnt++;
            loadFILE(fn);
        } else {
            // Not a file, so it's a directory, add to directory array to process
            //TODO - add capability to check if sub-dir processing is defined
            vpk.dCnt++;
            vpk.dirFS.push(fn);
        }
    }

    // done processing files in directory, clear the file array
    vpk.baseFS = [];
    vpk.uid = [];

};


//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var loadFILE = function(fn) {
    if (fn.endsWith('explains.json')) {
        // the expains.json file gets skipped
        return;
    }
    var contents;
    var hl = 0;
    var part = 0;
    vpk.yaml = '';

    try {
        contents = YAML.safeLoadAll(fs.readFileSync(fn)); //js-yaml 

        // determine if this is a valid kubernetes yaml file			
        if (typeof contents[0] !== 'undefined' && contents[0] !== null) {
            hl = contents.length;
        } else {
            hl = 1;
        }

        if (contents[0] !== null) {
            for (part = 0; part < hl; part++) {
                vpk.yaml = contents[part];
                processYAML(fn, part);
            }
        } else {
            utl.count('_blank','_blank','_blank');
        }
    } catch (err) {
        utl.logMsg('vpkFIO001 - Skipped file, unable to parse as YAML, file name: ' + fn );
        vpk.xCnt++;
    }
};


//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var processYAML = function(fn, part) {
    var valid = true; // indicate if yaml is valid, true = yes, false = no
    var y_ns = '';
    var y_kind = '';
    var y_name = '';

    fp = fn.indexOf('config');
    fnum = fn.substring(fp + 6, fn.length - 5) + '.' + part;

    try {
        // determine if this is a valid kubernetes yaml file			
        if (typeof vpk.yaml !== 'undefined') {
            if (typeof vpk.yaml.apiVersion !== 'undefined') {
                //y_apiV = vpk.yaml.apiVersion;
                if (typeof vpk.yaml.kind !== 'undefined') {
                    y_kind = vpk.yaml.kind;
                } else {
                    valid = false;
                }
            } else {
                valid = false;
            }
        }

        // check if metadata tag is found
        if (valid) {
            if (typeof vpk.yaml.metadata !== 'undefined') {
                if (typeof vpk.yaml.metadata.name !== 'undefined') {
                    y_name = vpk.yaml.metadata.name;
                } else {
                    valid = false;
                    utl.logMsg('vpkFIO036 - Missing metadata.name located ' + y_kind + ' fnum: ' + fnum );
                }
            }
        }

        // set namespace 
        if (typeof vpk.yaml.metadata.namespace !== 'undefined') {
            y_ns = vpk.yaml.metadata.namespace;
        } else {
            // no namespace defined, will treat as cluster level resource
            y_ns = 'cluster-level';
        }

        xref.checkXrefs(fnum);

        // if valid yaml 
        if (valid) {
            // check if yaml status should be dropped
            if (vpk.dropStatus) {
                if (y_kind === 'Pod') {
                    if (typeof vpk.yaml.status !== 'undefined') {
                        cStatus = vpk.yaml.status
                        if (typeof vpk.yaml.status.phase !== 'undefined') {
                            statusPhase = vpk.yaml.status.phase;
                        }
                    } else {
                        cStatus = {};
                    }
                }
            }

            vpk.apiFnum[fnum] = {
                'apiVersion': vpk.yaml.apiVersion,
                'namespace': y_ns,
                'kind': y_kind
            }

            // add resource to global vpk
            let item = {
                'apiVersion': vpk.yaml.apiVersion,
                'namespace': vpk.yaml.metadata.namespace, 
                'kind': vpk.yaml.kind, 
                'name': vpk.yaml.metadata.name, 
                'fnum': fnum
            };
            vpk.allKeys.push(item);

            // add uid to global vpk
            if (typeof vpk.allUids[vpk.yaml.metadata.uid] === 'undefined' ) {
                if (typeof vpk.yaml.metadata.uid !== 'undefined') { 
                    vpk.allUids[vpk.yaml.metadata.uid] = {
                        'fnum': fnum,
                        'namespace': vpk.yaml.metadata.namespace, 
                        'kind': vpk.yaml.kind, 
                        'name': vpk.yaml.metadata.name,
                        'api': vpk.yaml.apiVersion
                    }
                } else {
                    vpk.allUids[fn] = {     // no system uid, using generated id
                        'fnum': fnum,
                        'namespace': vpk.yaml.metadata.namespace, 
                        'kind': vpk.yaml.kind, 
                        'name': vpk.yaml.metadata.name,
                        'api': vpk.yaml.apiVersion
                    };
                }
            }

            if (y_kind === 'Pod') {
                if (typeof vpk.podList[fnum] === 'undefined') {
                    vpk.podList[fnum] = {'fnum': fnum, 'namespace': y_ns };

                    if (typeof vpk.yaml.metadata.ownerReferences !== 'undefined') {
                        vpk.podList[fnum].owners = vpk.yaml.metadata.ownerReferences;
                           
                    }   
                }
            }

            // add to located list of namespaces
            utl.checkDefinedNamespace(y_ns);

            // check the kind definition 
            utl.checkKind(y_kind);

 
            // check metadata.labels exists
            if (typeof vpk.yaml.metadata !== 'undefined') {
                lbl.checkLabels(y_ns, 'Labels', y_name, vpk.yaml.metadata, fnum);
            }

            // check spec.template labels exist
            if (typeof vpk.yaml.spec !== 'undefined' && vpk.yaml.spec !== null) {
                if (typeof vpk.yaml.spec.template !== 'undefined') {
                    if (typeof vpk.yaml.spec.template.metadata !== 'undefined') {
                        lbl.checkLabels(y_ns, 'PodLabels', y_name, vpk.yaml.spec.template.metadata, fnum);
                    }
                }
            }

            // check if spec.selector.matchLabels exist
            if (typeof vpk.yaml.spec !== 'undefined' && vpk.yaml.spec !== null) {
                if (typeof vpk.yaml.spec.selector !== 'undefined') {
                    if (typeof vpk.yaml.spec.selector.matchLabels !== 'undefined') {
                        lbl.checkMatchLabels(y_ns, 'MatchLabels', y_name, vpk.yaml.spec.selector.matchLabels, fnum);
                    }
                }
            }

            if (typeof vpk.apis[vpk.yaml.apiVersion] === 'undefined') {
                vpk.apis[vpk.yaml.apiVersion] = [];
            }

            var api = vpk.yaml.apiVersion;
            var apiParts = api.split('/');
            if (typeof apiParts[0] !== 'undefined') {
                var apiKey = apiParts[0];
                if (typeof vpk.k8apis[apiKey] === 'undefined') {
                    if (typeof vpk.apis[vpk.yaml.apiVersion][y_kind] === 'undefined') {
                        vpk.apis[vpk.yaml.apiVersion][y_kind] = 1
                    } else {
                        vpk.apis[vpk.yaml.apiVersion][y_kind] = vpk.apis[vpk.yaml.apiVersion][y_kind] + 1;
                    }
                } else {
                    // do nothing a valid k8 api type is located
                }
            }

            //ToDo: does checkOwnerReferences need to deal with multiple containers
            oRef = checkOwnerReferences(y_kind, y_name, y_ns);

            // increment yaml counter
            vpk.yCnt++;

            //
            if (typeof y_ns === 'undefined' || y_ns === null || y_ns === '') {
                utl.count(y_kind, 'cluster-level', y_name)
            } else {
                utl.count(y_kind, y_ns, y_name);
            }

            // check if Services should be run through generic
            genericParse.parse(y_ns, y_kind, y_name, fnum);

            // parse and populate
            switch (y_kind) {
                case 'ClusterRole':
                    roleParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'ClusterRoleBinding':
                    roleBindingParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'ControllerRevision':
                    controllerRevisionParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'CronJob':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'CSIDriver':
                    CSIParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;                
                case 'CSINode':
                    CSIParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break; 
                case 'CustomResourceDefinition':
                    crdParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'DaemonSet':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Deployment':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Endpoints':           
                    endpointsParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'EndpointSlice':
                    endpointSliceParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);    
                    break;
                case 'Event':           
                    eventParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'HorizontalPodAutoscaler':    
                    hpaParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'Job':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'PersistentVolume':
                    persistentVolumeParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'PersistentVolumeClaim':
                    persistentVolumeClaimParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'Pod':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ReplicaSet':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ReplicationController':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Role':
                    roleParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'RoleBinding':
                    roleBindingParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'Secret':
                    secretParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'Service':
                    serviceParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'ServiceAccount':
                    serviceAccountParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                case 'StatefulSet':
                    processContainer(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'StorageClass':
                    storageClassParse.parse(y_ns, y_kind, y_name, vpk.yaml, fnum);
                    break;
                default:
                    if (typeof vpk.yaml.spec !== 'undefined' ) {
                        if (vpk.yaml.spec !== null ) {
                            if (typeof vpk.yaml.spec.containers !== 'undefined') {
                                processContainer(y_ns, y_kind, y_name, fn, part);
                            } else {
                                if (typeof vpk.yaml.spec.template !== 'undefined') {
                                    if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
                                        if (typeof vpk.yaml.spec.template.spec.containers !== 'undefined') {
                                            processContainer(y_ns, y_kind, y_name, fn, part);
                                        }    
                                    }
                                }
                            }
                        }
                    }
            }

        } else {
            // utl.logMsg('vpkFIO095 - File skipped not valid for processing file: ' + fn );
            // increment x counter, x = not Kube YAML
            vpk.xCnt++;
        }

    } catch (err) { 
        utl.logMsg('vpkFIO005 - Error processing error file fnum: ' + fnum + ' message: ' + err.message );
        utl.logMsg('vpkFIO005 - stack: ' + err.stack);
        vpk.xCnt++;
    }
};


// container specific logic
var processContainer = function(y_ns, y_kind, y_name, fn, part) {
    let nodeName = '';
    if (typeof vpk.yaml.spec !== 'undefined') {
        if (typeof vpk.yaml.spec.nodeName !== 'undefined') {
            nodeName = vpk.yaml.spec.nodeName;
        }
    }

    // create the vpk.container entry and populate / update
    if (typeof vpk.containers[fnum] === 'undefined') {
        vpk.containers[fnum] = {
            'src': fn, 
            'part': part,
            'fnum': fnum,
            'uid': vpk.yaml.metadata.uid,
            'api': vpk.yaml.apiVersion,
            'kind': y_kind, 
            'name': y_name, 
            'namespace': y_ns, 
            'containerNames': [],
            'typeCcnt': 0,
            'typeIcnt': 0,
            'node': nodeName,
            'oRef': [],
            'status': cStatus,
            'phase': statusPhase
        };
    }

    vpk.containers[fnum].oRef = oRef;

    // check if secret used for imagePull
    if (typeof vpk.yaml.spec.imagePullSecrets !== 'undefined') { 
        for (let p = 0; p < vpk.yaml.spec.imagePullSecrets.length; p++) {
            utl.containerLink(fnum, 'Secret', vpk.yaml.spec.imagePullSecrets[p].name,'ImagePull')
        }
    } 

    // container
    if (typeof vpk.yaml.spec.containers !== 'undefined') {
        containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.containers, 'C', fnum);
    }
    // initContainer
    if (typeof vpk.yaml.spec.initContainers !== 'undefined') {
        containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.containers, 'I', fnum);
    }

    if (typeof vpk.yaml.spec.volumes !== 'undefined') {
        volumeParse.parse(y_ns, 'Volume', y_name, vpk.yaml.spec.volumes, y_kind, fnum, nodeName);
    }

    if (typeof vpk.yaml.spec.nodeSelector !== 'undefined') {
        nodeSelectorParse.parse(y_ns, 'NodeSelector', y_name, vpk.yaml.spec.nodeSelector, y_kind, fnum);
    }

    if (typeof vpk.yaml.spec.serviceAccount !== 'undefined') {
        utl.containerLink(fnum, 'ServiceAccount', vpk.yaml.spec.serviceAccount)
    }

    // container related
    if (typeof vpk.yaml.spec.template !== 'undefined') {
        if (typeof vpk.yaml.spec.template.spec !== 'undefined') {

            if (typeof vpk.yaml.spec.template.spec.containers !== 'undefined') {
                containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec.containers, 'C', fnum);
			}    

            if (typeof vpk.yaml.spec.template.spec.initContainers !== 'undefined') {
                containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec.initContainers, 'I', fnum);
            }
 
            if (typeof vpk.yaml.spec.template.spec.volumes !== 'undefined') {
                volumeParse.parse(y_ns, 'Volume', y_name, vpk.yaml.spec.template.spec.volumes, y_kind, fnum, nodeName);
            }

            if (typeof vpk.yaml.spec.template.spec.nodeSelector !== 'undefined') {
                nodeSelectorParse.parse(y_ns, 'NodeSelector', y_name, vpk.yaml.spec.template.spec.nodeSelector, y_kind, fnum);
            }
            
            if (typeof vpk.yaml.spec.template.spec.serviceAccount !== 'undefined') {
                utl.containerLink(fnum, 'ServiceAccount', vpk.yaml.spec.template.spec.serviceAccount)
            }

            if (typeof vpk.yaml.spec.template.spec.volumeClaimTemplates !== 'undefined') {
                volumeClaimTemplatesParse.parse(y_ns, 'VolumeClaimTemplates', y_name, vpk.yaml.spec.template.spec.volumeClaimTemplates, y_kind, fnum);
            }
        }
    }

    // if (typeof vpk.yaml.spec.volumeClaimTemplates !== 'undefined') {
    //     volumeClaimTemplatesParse.parse(y_ns, 'VolumeClaimTemplates', y_name, vpk.yaml.spec.volumeClaimTemplates, y_kind, fnum);
    // }

};

// estabilsh owner if possible
var checkOwnerReferences = function(kind, name, ns) {
    try {
        let oRef = [];
        if (typeof vpk.yaml.metadata.uid !== 'undefined') {
            let uid = vpk.yaml.metadata.uid;
            let kind = vpk.yaml.kind;
            let ownerId = 'self';
            let ownKind = 'self';
            let childAPI = vpk.yaml.apiVersion;
            let ownAPI;

            if (typeof vpk.yaml.metadata.ownerReferences !== 'undefined') {
                oRef = vpk.yaml.metadata.ownerReferences;

                for (let i = 0; i < vpk.yaml.metadata.ownerReferences.length; i++) {
                    ownerId = '';
                    ownKind = 'self';

                    if (typeof vpk.yaml.metadata.ownerReferences[i].uid !== 'undefined') {
                        ownerId = vpk.yaml.metadata.ownerReferences[i].uid;
                        if (ownerId === uid) {
                            console.log('Matching UIDs')
                        }
                    } else {
                        ownerId = 'none';
                    }

                    if (typeof vpk.yaml.metadata.ownerReferences[i].kind !== 'undefined') {
                        ownKind = vpk.yaml.metadata.ownerReferences[i].kind;
                    } else {
                        ownKind = 'none';
                    }

                    if (typeof vpk.yaml.metadata.ownerReferences[i].apiVersion !== 'undefined') {
                        ownAPI = vpk.yaml.metadata.ownerReferences[i].apiVersion;
                    } else {
                        ownAPI = 'none';
                    }

                    let oTemp = [];
                    if (typeof vpk.ownerUids[ownerId] === 'undefined') {
                        vpk.ownerUids[ownerId] = [];
                    } else {
                        oTemp = vpk.ownerUids[ownerId];
                    }

                    oTemp.push({
                        'ownerId': ownerId, 
                        'ownerKind': ownKind, 
                        'ownerAPI': ownAPI,
                        'childAPI': childAPI,
                        'childUid': uid,          
                        'childFnum': fnum, 
                        'childKind': kind, 
                        'childName': name,
                        'childNS': ns
                    })

                    vpk.ownerUids[ownerId] = oTemp;

                    if (typeof vpk.childUids[uid] === 'undefined') {
                        vpk.childUids[uid] = {
                            'parentUid': ownerId,
                            'parentKind': ownKind,
                            'parentAPI': ownAPI,
                            'childAPI': childAPI,
                            'childKind': kind,
                            'childFnum': fnum,
                            'childName': name,
                            'childNS': ns,
                            'parentMulti': []
                        }
                    } else {
                        vpk.childUids[uid].parentMulti.push({
                            'id': ownerId,
                            'kind': ownKind
                        })
                        //console.log('multi-parent: kind: ' + kind + ' fnum: ' + fnum + ' oSize: ' 
                        //+ vpk.childUids[uid].parentMulti.length + ' ownerKind: ' + ownKind + ' id: ' + ownerId)
                    }
            
                }
            }  else { // no ownerReference defined

                if (typeof vpk.ownerUids[uid] === 'undefined') {
                    vpk.ownerUids[uid] = [];
                } 
                if (typeof vpk.ownerUids[uid][0] === 'undefined') {
                    vpk.ownerUids[uid].push({
                        'ownerId': 'self', 
                        'ownerKind': kind, 
                        'childAPI': childAPI,
                        'childUid': uid, 
                        'childFnum': fnum, 
                        'childKind': kind, 
                        'childName': name,
                        'childNS': ns
                    })
                }
            }
        } else {  // no uid found in yaml
            vpk.ownerNumber = vpk.ownerNumber + 1;
            let sid = 'sys' + vpk.ownerNumber;
            if (typeof vpk.ownerUids[sid] === 'undefined') {
                vpk.ownerUids[sid] = [];
            } 
            if (typeof vpk.ownerUids[sid][0] === 'undefined') {
                vpk.ownerUids[sid].push({
                    'ownerId': 'self', 
                    'ownerKind': kind, 
                    'childUid': sid, 
                    'childFnum': fnum, 
                    'childKind': kind, 
                    'childName': name,
                    'childNS': ns
                })
            }
        }
    } catch (err) {
        utl.logMsg('vpkFIO095 - Error processing ownerChain, message: ' + err);
        utl.logMsg(err.stack);
    }
    return oRef;
}


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    checkDir: function() {
        try {
            // check if there are any directories to be processed, if none stop looping
            if (vpk.dirPtr + 1 >= vpk.dirFS.length) {
                vpk.loop = false;
            } else {
                // get directory name off stack and read
                vpk.dirPtr++;
                vpk.dirname = vpk.dirFS[vpk.dirPtr];
                //console.log('working directory: ' + vpk.dirname );
                readDIR(vpk.dirname);
            }

            // determine if all files have been processed
            if (typeof vpk.baseFS[0] !== 'undefined') {
                loopBaseFS();
            }
        } catch (err) {
            utl.logMsg('vpkFIO129 - Error: ' + err);
            utl.logMsg('vpkFIO128 - Error: ' + err.stack);
        }

        // done with this directory
        return;
    
    }

};
