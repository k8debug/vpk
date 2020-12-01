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


*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
var hierarchy = require('../lib/hierarchy');

  
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parsePersistentVolume = function(ns, kind, name, obj, src, part, fnum) {
    var persistentVolume = {};
    var storClass = '';
    var hostPath ='';
    var nfsPath = '';
    var localPath = '';
    var keys;
    var key;
    var label;
    var data;
    var pName;
    var cRefName = '';
    var cRefKind = '';
    var cRefNS = '';
    var cRefUid = '';
    var capacity = '';

    try {
        if (typeof obj.metadata.name !== 'undefined') {
            pName = obj.metadata.name
        }

        if (typeof obj.metadata.labels !== 'undefined') {
            if (typeof obj.metadata.labels !== 'undefined') {
                label = obj.metadata.labels;
                keys = Object.keys(obj.metadata.labels);
                key = keys[0];
                data = key + ': ' + label[keys[0]]
            }            
        } else {
            data = '';
        }   

        obj = obj.spec;

        persistentVolume = {
            'namespace': ns,
            'kind': kind,
            'objName': name
        };

        if (typeof obj.capacity !== 'undefined') {
            if (typeof obj.capacity.storage !== 'undefined') {
                capacity = obj.capacity.storage;
                persistentVolume.storage = obj.capacity.storage;
            }
        }

        if (typeof obj.persistentVolumeReclaimPolicy !== 'undefined') {
            persistentVolume.reclaim = obj.persistentVolumeReclaimPolicy;
        }

        if (typeof obj.storageClassName !== 'undefined') {
            persistentVolume.storageClass = obj.storageClassName;
            storClass = obj.storageClassName;
        } else {
            storClass = '';
        }

        if (typeof obj.accessModes !== 'undefined') {
            var hl = obj.accessModes.length;
            var modes = [];
            for (var m = 0; m < hl; m++) {
                modes.push(obj.accessModes[m]);
            }
            persistentVolume.accessModes = modes;
        }

        if (typeof obj.hostPath !== 'undefined') {
            if (typeof obj.hostPath.path !== 'undefined') {
                hostPath = obj.hostPath.path;
                persistentVolume.hostPath = obj.hostPath.path;
            }
        }

        if (typeof obj.nfs !== 'undefined') {
            if (typeof obj.nfs.path !== 'undefined') {
                nfsPath = obj.nfs.path;
                persistentVolume.nfsPath = obj.nfs.path;
            }
            if (typeof obj.nfs.server !== 'undefined') {
                persistentVolume.nfsServer = obj.nfs.server;
            }
        }

        if (typeof obj.local !== 'undefined' && obj.local !== null ) {
            if (typeof obj.local.path !== 'undefined') {
                localPath = obj.local.path;
                persistentVolume.local = obj.local.path;
            }
        }

        if (typeof obj.claimRef !== 'undefined') {
            if (typeof obj.claimRef.kind !== 'undefined') {
                cRefKind = obj.claimRef.kind;
            }
            if (typeof obj.claimRef.name !== 'undefined') {
                cRefName = obj.claimRef.name;
            }
            if (typeof obj.claimRef.namespace !== 'undefined') {
                cRefNS = obj.claimRef.namespace;
            }
            if (typeof obj.claimRef.uid !== 'undefined') {
                cRefUid = obj.claimRef.uid;
            }
        }

        if (typeof vpk.pvcFnum[fnum] === 'undefined') {
            vpk.pvFnum[fnum] = [];
        }
        vpk.pvFnum[fnum].push({
            'name': name,
            'fnum': fnum, 
            'label': data,
            'storageClass': storClass, 
            'hostPath': hostPath,
            'localPath': localPath,
            'nfsPath': nfsPath,
            'cRefKind': cRefKind,
            'cRefName': cRefName,
            'cRefNS': cRefNS,
            'cRefUid': cRefUid,
            'capacity': capacity
        })

        if (typeof vpk.pvLinks[pName] === 'undefined') {
            vpk.pvLinks[pName] = []
        }
        vpk.pvLinks[pName].push({
            'name': name,
            'fnum': fnum, 
            'label': data,
            'storageClass': storClass, 
            'hostPath': hostPath,
            'localPath': localPath,
            'nfsPath': nfsPath,
            'cRefKind': cRefKind,
            'cRefName': cRefName,
            'cRefNS': cRefNS,
            'cRefUid': cRefUid,
            'capacity': capacity
        });
        if (typeof vpk.pvLabels[data] === 'undefined') {
            vpk.pvLabels[data] = []
        }
        vpk.pvLabels[data].push({
            'name': name,
            'fnum': fnum, 
            'label': data,
            'storageClass': storClass, 
            'hostPath': hostPath,
            'localPath': localPath,
            'nfsPath': nfsPath,
            'cRefKind': cRefKind,
            'cRefName': cRefName,
            'cRefNS': cRefNS,
            'cRefUid': cRefUid,
            'capacity': capacity
        });



        if (storClass !== '') {
            if (typeof vpk.storageClassLinks[storClass] === 'undefined') {
                vpk.storageClassLinks[storClass] = [];
            }
            vpk.storageClassLinks[storClass].push({
                'usedByPV': pName, 
                'fnum': fnum
            });
        }


        var lkey = ns + '.' + kind + '.' + name;
        utl.checkType('PersistentVolume', lkey);
        var tmp = vpk['PersistentVolume'][lkey];
        persistentVolume.sourceFile = src;
        persistentVolume.sourcePart = part;

        tmp.push(persistentVolume);

        // add the information to cluster hierarchy
        hierarchy.addEntry(ns, kind, name, src, part)

        vpk['PersistentVolume'][lkey] = tmp;
        utl.checkKind('PersistentVolume');
        utl.countKind('PersistentVolume');

        // check storage class name
        if (storClass !== '') {
            // xref storage class
            var xkey = ns + '.' + 'StorageClass' + '.' + storClass;
            utl.checkType('StorageClass', xkey);
            tmp = vpk['StorageClass'][xkey];
            item = {
                'namespace': ns,
                'kind': 'StorageClass',
                'objName': storClass,
                'sourceFile': src,
                'sourcePart': part
            };
            tmp.push(item);
            vpk['StorageClass'][xkey] = tmp;
            utl.checkKind('StorageClass','U');
            utl.countKind('StorageClass');      


            // xref storage class usage
            var xkey = ns + '.' + storClass;
            utl.checkType('StorageClassUse', xkey);
            tmp = vpk['StorageClassUse'][xkey];
            var item = {
                'namespace': ns,
                'kind': kind,
                'objName': name,
                'storgeClassName': storClass,
                'sourceFile': src,
                'sourcePart': part
            };
            tmp.push(item);

            // add the information to cluster hierarchy
            hierarchy.addEntry(ns, kind, name, src, part, 'StorageClass', storClass)

            vpk['StorageClassUse'][xkey] = tmp;
            utl.checkKind('StorageClassUse','U');
            utl.countKind('StorageClassUse');
        }

    } catch (err) {
        utl.logMsg('vpkPVP001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err );
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part, fnum) {

        parsePersistentVolume(ns, kind, name, obj, src, part, fnum);

    }

};