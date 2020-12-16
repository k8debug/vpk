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

const vpk = require("../lib/vpk");
const utl = require('../lib/utl');
let data = '';
let podNS = [];

//----------------------------------------------------------
// build svg data from returned data
//----------------------------------------------------------

let messages = [];

const parseSchematic = function(idata) {

    // if (typeof idata === 'undefined') {
    //     data = vpk.allKeys;
    // } else {
    //     data = idata;
    // }
    podNS = [];

    data = vpk.allKeys;    
    // sort by namespace & kind
    data.sort((a, b) => (a.namespace > b.namespace) ? 1 : (a.namespace === b.namespace) ? ((a.kind > b.kind) ? 1 : -1) : -1 );
    

    populateBaseContainer(data);
    populateServices();
    populateRoleBinding();
    populateServiceAccountSecrets();
    populateControllerRevision();
    populateNetwork();
    populateOwnerChain();
    populateStorage();
    populateHPA();
    populateRoles();
    populateClusterRoles();
    vpk.containers['0000-@subjects@'] = vpk.subjects;
    populateClusterLevelBindings();
    populateClusterRoleBindingsAtNamespace();
    populatePodsToShow();

    let hb = JSON.stringify(vpk.containers);
    let bl = hb.length;
    hb = null;    
    utl.logMsg('vpkSCM901 - Container size - ' + formatBytes(bl) );

    for (let e = 0; e < vpk.eventMessage.length; e++) {   
        if (vpk.eventMessage[e].used !== true) {
            //utl.logMsg('vpkSCM300 - Non used events: ' + JSON.stringify(vpk.eventMessage[e], null, 4));
        }
    }

    return messages;
}

const populateClusterRoles = function() {
    let keys = Object.keys(vpk.clusterRoleFnum);
    let key;
    let role;

    vpk.containers['0000-@clusterRoles@'] = {};
    vpk.containers['0000-@clusterRoles@'].Role = [];

    try {
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            role = vpk.clusterRoleFnum[key];
            vpk.containers['0000-@clusterRoles@'].Role.push({
                'name': role[0].name,
                'fnum': role[0].fnum,
                'type': 'c',
                'rules': role[0].rules
            })
        }
    } catch(err) {
        utl.logMsg('vpkSCM001 - Error building clusterRoles, key: ' + key + '  message: ' + err);
        utl.logMsg(err.stack);
    }
}

const populateRoles = function() {
    let keys = Object.keys(vpk.roleFnum);
    let key;
    let cKey;

    try {
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            if (typeof vpk.roleFnum[key][0].namespace !== 'undefined') {
                cKey = '0000-' + vpk.roleFnum[key][0].namespace;
                if (typeof vpk.containers[cKey] !== 'undefined') {
                    if (typeof vpk.containers[cKey].Roles === 'undefined') {
                        vpk.containers[cKey].Role = [];
                    }
                    vpk.containers[cKey].Role.push({
                        'name': vpk.roleFnum[key][0].name,
                        'fnum': vpk.roleFnum[key][0].fnum,
                        'rules': vpk.roleFnum[key][0].rules,
                        'type': 'r',
                        'api': vpk.roleFnum[key][0].api
                    })
                }
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM049 - Error processing Role, message: ' + err );
        utl.logMsg('vpkSCM149 - Error: ' + err.stack);
    }

}

const populateClusterLevelBindings = function() {
    let keys = Object.keys(vpk.clusterRoleBindingFnum);
    let key;
    let binding;    
    vpk.containers['0000-@clusterRoleBinding@'] = {};
    vpk.containers['0000-@clusterRoleBinding@'].RoleBinding = [];

    try {
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            binding = vpk.clusterRoleBindingFnum[key];
            vpk.containers['0000-@clusterRoleBinding@'].RoleBinding.push({
                'name': binding[0].name,
                'fnum': binding[0].fnum,
                'namespace': 'clusterLevel',
                'kind': 'ClusterRoleBinding',
                'api': binding[0].api,
                'roleRef': binding[0].roleRef,
                'subjects': binding[0].subjects,
                'userNames': binding[0].userNames
            })
        }
    } catch(err) {
        utl.logMsg('vpkSCM001 - Error building clusterRoleBindings, key: ' + key + '  message: ' + err);
    }
}

const formatBytes = function(bytes, decimals = 2) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const populateBaseContainer = function (data) {
    let e;
    // let src;
    // let part;
    // let fp;
    let fnum;
    //let pCnt = 0;

    try {
        for (e = 0; e < data.length; e++) {
            // check if this resource has any containers defined
            // src = data[e].src
            // part = data[e].part
            // fp = src.indexOf('config');
            // fnum = src.substring(fp + 6, src.length - 5) + '.' + part;

            //utl.usedFnum(fnum, 'Unmapped', data[e].kind,  data[e].namespace,)
            fnum = data[e].fnum;
            checkUsage(data[e], fnum)
            
            if (typeof vpk.containers[fnum] !== 'undefined') {
                populateContainer(vpk.containers[fnum], fnum);
                //pCnt++;
                //utl.usedFnum(fnum, 'Container');
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM001 - Error processing schematic, fnum: ' + fnum + '  message: ' + err);
        utl.logMsg('vpkSCM101 - Error: ' + err.stack);
    }
    //utl.logMsg('vpkSCM701 - Populated container count: ' + pCnt);
}

const populateNetwork = function () {
    try {
        populateEndpoints() ;
        populateEndpointSlice() ;
    } catch (err) {
        utl.logMsg('vpkSCM005 - Error processing schematic, message: ' + err);
        utl.logMsg('vpkSCM105 - Error: ' + err.stack);
    }
}

const populateOwnerChain = function () {
    let keys;
    let key;
    let level1Kind;
    let level2Kind;
    let chain;
    let cUid;
    try {
        keys = Object.keys(vpk.containers);
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            level1Kind = '';
            level2Kind = '';
            vpk.containers[key].display = '';

            cUid = vpk.containers[key].uid;

            if (typeof vpk.ownerChains[cUid] !== 'undefined') {
                chain = vpk.ownerChains[cUid];
                vpk.containers[key].creationChain = {};
                if (typeof chain[1] !== 'undefined') {
                    vpk.containers[key].creationChain.level1Fnum = chain[1].fnum; 
                    vpk.containers[key].creationChain.level1Kind = chain[1].kind;
                    vpk.containers[key].creationChain.level1Name = chain[1].name;
                    vpk.containers[key].creationChain.level1API  = 'unknown';
                    level1Kind = chain[1].kind;

                    // check CRDs
                    if (typeof vpk.crds[level1Kind] !== 'undefined') {
                        if(typeof vpk.containers[key].CRD === 'undefined') {
                            vpk.containers[key].CRD = [];
                        }
                        vpk.containers[key].CRD.push({
                            'level1CRD': true,
                            'level1Fnum': vpk.crds[level1Kind][0].fnum,
                            'level1Name': vpk.crds[level1Kind][0].name
                        })
                    }

                    if (typeof chain[2] !== 'undefined') {
                        vpk.containers[key].creationChain.level2Fnum = chain[2].fnum; 
                        vpk.containers[key].creationChain.level2Kind = chain[2].kind;
                        vpk.containers[key].creationChain.level2Name = chain[2].name;
                        vpk.containers[key].creationChain.level2API  = 'unknown';
                        level2Kind = chain[2].kind;

                        if (typeof vpk.crds[level2Kind] !== 'undefined') {
                            if(typeof vpk.containers[key].CRD === 'undefined') {
                                vpk.containers[key].CRD = [];
                            }
                            vpk.containers[key].CRD.push({
                                'level2CRD': true,
                                'level2Fnum': vpk.crds[level2Kind][0].fnum,
                                'level2Name': vpk.crds[level2Kind][0].name
                            })
                        }
                    } else {
                        //console.log('research')
                    }
                } else {
                    vpk.containers[key].creationChain.level1Kind = chain[0].ownerKind;
                    if (typeof vpk.allUids[chain[0].ownerUid] !== 'undefined') {
                        let tmp = vpk.allUids[chain[0].ownerUid]
                        vpk.containers[key].creationChain.level1Fnum = tmp.fnum; 
                        vpk.containers[key].creationChain.level1Kind = tmp.kind;
                        vpk.containers[key].creationChain.level1Name = tmp.name;
                        vpk.containers[key].creationChain.level1API  = 'unknown';
                    }
                }
            }
        }
    } catch (err1) {
        utl.logMsg('vpkSCM021 - Error processing level1 and level2 uids, message: ' + (err1));
        utl.logMsg('vpkSCM121 - Error: ' + err1.stack);
    }

    // populate display flag
    
    try {
        keys = Object.keys(vpk.containers);
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            if (typeof vpk.containers[key] !== 'undefined') {
                if (typeof vpk.podList[key] === 'undefined') {
                    vpk.containers[key].display = false;
                } else {
                    vpk.containers[key].display = true;
                    //displayCnt++;
                    let ns = vpk.containers[key].namespace
                    if (typeof podNS[ns] === 'undefined' ) {
                        podNS.push(ns)
                    }
                }
            }
        }
        //utl.logMsg('vpkSCM025 - Flagged ' + displayCnt + ' active containers to display'); 
    } catch (err) {
        utl.logMsg('vpkSCM030 - Error processing schematic, message: ' + err.stack);
    }

}

const populatePodsToShow = function () {
    let ns;
    let key;
    try {
        for (let i = 0; i < podNS.length; i++) {
            ns = podNS[i];
            key = '0000-' + ns;
            if (typeof vpk.containers[key].Pods === 'undefined') { 
                vpk.containers[key].Pods = true;
            }
        }
        podNS = null;
    } catch (err) {
        utl.logMsg('vpkSCM830 - Error building container Pods flag, message: ' + err);
        utl.logMsg(err.stack);
    }

}

const populateStorage = function () {
    let keys;
    let key;
    let pvc
    let claimFnum;
    let cName;
    let pvcName = '';
    let pvcFnum = '';
    let pvcStorageClass = '';
    let pvcVolumeName = '';
    let pvcSelectorLabel = '';
    let pvName = '';
    let pvFnum = '';
    let pvLocalPath = '';
    let pvHostPath = '';
    let pvNFSPath = '';
    let scName = '';
    let scFnum = '';
    let pvKeys = Object.keys(vpk.pvFnum);
    let pvKey;
    try {
        keys = Object.keys(vpk.containers);
        for (let i = 0; i < keys.length; i++) {
            key = keys[i];
            if (typeof vpk.containers[key].PersistentVolumeClaim !== 'undefined') {
                for (let p = 0; p < vpk.containers[key].PersistentVolumeClaim.length; p++) {
                    pvc = vpk.containers[key].PersistentVolumeClaim[p];
                    if (typeof pvc.podPVCClaimName !== 'undefined') {
                        cName = pvc.podPVCClaimName;
                        if (typeof vpk.pvcNames[cName] !== 'undefined') {
                            claimFnum = vpk.pvcNames[cName][0].fnum;
                            pvcName = cName;

                            if (typeof vpk.pvcLinks[cName] !== 'undefined') {


                                if (typeof vpk.pvcLinks[cName][0] !== 'undefined') {
                                    pvcFnum = vpk.pvcLinks[cName][0].fnum;
                                    pvcStorageClass = vpk.pvcLinks[cName][0].storageClass;
                                    pvcVolumeName = vpk.pvcLinks[cName][0].volumeName;
                                    // added to fix missing PV in schematics
                                    pvName = vpk.pvcLinks[cName][0].volumeName;
                                    pvFnum = '<ukn>'
                                    for (let v = 0; v < pvKeys.length; v++) {
                                        if (vpk.pvFnum[pvKeys[v]][0].name === pvName) {
                                            pvFnum = pvKeys[v];
                                            break;
                                        }
                                    }
                                    //---
                                    pvcSelectorLabel = vpk.pvcLinks[cName][0].pvSelectorLabel;
                                }
                                if (pvcStorageClass !== '') {
                                    if (typeof vpk.storageClassName[pvcStorageClass] !== 'undefined') {
                                        scName = vpk.storageClassName[pvcStorageClass].name;
                                        scFnum = vpk.storageClassName[pvcStorageClass].fnum;
                                    } else {
                                        // let msg = 'PVC is unable to locate StorageClass named: ' + pvcStorageClass;
                                        // putMsg(msg, 'Storage', key)
                                    }
                                }
                                
                                if (pvcSelectorLabel !== '') {
                                    if (typeof vpk.pvLabels[pvcSelectorLabel] !== 'undefined') {
                                        pvName = vpk.pvLabels[pvcSelectorLabel][0].name;
                                        pvFnum = vpk.pvLabels[pvcSelectorLabel][0].fnum;
                                        pvLocalPath = vpk.pvLabels[pvcSelectorLabel][0].localPath;
                                        pvHostPath = vpk.pvLabels[pvcSelectorLabel][0].hostPath;
                                        pvNFSPath = vpk.pvLabels[pvcSelectorLabel][0].nfsPath;
                                        scName = vpk.pvLabels[pvcSelectorLabel][0].storageClass;
                                        if (scName !== '') {
                                            if (typeof vpk.storageClassName[scName] !== 'undefined') {
                                                scFnum = vpk.storageClassName[scName][0].fnum;
                                            } else {
                                                // let msg = 'PV label unable to locate StorageClass named: ' + scName;
                                                // putMsg(msg, 'Storage', key)
                                            }
                                        } else {
                                            scFnum = '0';
                                        }
                                    }
                                } else {

                                }
                            }
                        
                            vpk.containers[key].PersistentVolumeClaim[p].claimFnum = claimFnum;
                            vpk.containers[key].PersistentVolumeClaim[p].pvcName = pvcName;
                            vpk.containers[key].PersistentVolumeClaim[p].pvcFnum = pvcFnum;
                            vpk.containers[key].PersistentVolumeClaim[p].pvcStorageClass = pvcStorageClass;
                            vpk.containers[key].PersistentVolumeClaim[p].pvcVolumeName = pvcVolumeName;
                            vpk.containers[key].PersistentVolumeClaim[p].pvcSelectorLabel = pvcSelectorLabel;
                            vpk.containers[key].PersistentVolumeClaim[p].pvName = pvName;
                            vpk.containers[key].PersistentVolumeClaim[p].pvFnum = pvFnum;
                            vpk.containers[key].PersistentVolumeClaim[p].pvLocalPath = pvLocalPath;
                            vpk.containers[key].PersistentVolumeClaim[p].pvHostPath = pvHostPath;
                            vpk.containers[key].PersistentVolumeClaim[p].pvNFSPath = pvNFSPath;
                            vpk.containers[key].PersistentVolumeClaim[p].storageClassName = scName;
                            vpk.containers[key].PersistentVolumeClaim[p].storageClassFnum = scFnum;

                        } else {
                            // let msg = 'Unable to locate PersistentVolumeClaim named: ' + cName;
                            // putMsg(msg, 'Storage', key)
                            vpk.containers[key].PersistentVolumeClaim[p].claimFnum = '0';
                        }
                    }
                }
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM031 - Error processing schematic, message: ' + err.stack);
    }        
}

// sub-routines
const checkUsage = function(data, fnum) {

    if (data.kind === 'RoleBinding' || data.kind === 'Role') {
        return;
    }

    if (typeof data.namespace === 'undefined') {
        data.namespace = 'cluster-level'
        //utl.logMsg('vpkSCM073 - Namespace changed from undefined to clusterLevel for fnum: ' + fnum + ' with kind: ' + data.kind);
    }

    if (data.namespace === '' || data.namespace === 'cluster-level') {
        clusterLevel(data, data.kind, fnum)
    } else {
        namespaceLevel(data, data.kind, fnum)
    }
}

const namespaceLevel = function(data, type, fnum) {
    let ns;
    let name;
    if (typeof data.namespace === 'undefined') {
        ns = 'Unknown';
    } else {
        ns = data.namespace;
    }
    
    let cName = '0000-' + ns;

    if (typeof data.value !== 'undefined') {
        name = data.value
    } 
    if (typeof data.name !== 'undefined') {
        name = data.name
    }
    if (typeof vpk.containers[cName] === 'undefined') {
        vpk.containers[cName] = {};
    }
    if (typeof vpk.containers[cName][type] === 'undefined') {
        vpk.containers[cName][type] = [];
    }
    
    for (let i = 0; i < vpk.containers[cName][type].length; i++) {
        if (vpk.containers[cName][type][i].fnum === fnum) {
            return;
        }
    }

    vpk.containers[cName][type].push({
        'name': name,
        'fnum': fnum,
        'namespace': ns,
        'kind': data.kind,
        'api': data.apiVersion
    })
}

const clusterLevel = function(data, type, fnum) {
    let name;
    let cName = '0000-clusterLevel';

    if (typeof data.value !== 'undefined') {
        name = data.value
    } 
    if (typeof data.name !== 'undefined') {
        name = data.name
    }    

    if (typeof vpk.containers[cName] === 'undefined') {
        vpk.containers[cName] = {};
    }
    if (typeof vpk.containers[cName][type] === 'undefined') {
        vpk.containers[cName][type] = [];
    }

    for (let i = 0; i < vpk.containers[cName][type].length; i++) {
        if (vpk.containers[cName][type][i].fnum === fnum) {
            return;
        }
    }    
    
    vpk.containers[cName][type].push({
        'name': name,
        'fnum': fnum,
        'namespace': 'clusterLevel',
        'kind': data.kind,
        'api': data.apiVersion
    })
}

const populateHPA = function() {
    let keys = Object.keys(vpk.hpaLinks);
    //let key;
    let hl = keys.length;
    let cKeys = Object.keys(vpk.containers);;
    let cKey;
    let chl = cKeys.length;
    let hKind;
    let hName;
    let found;
    let pKey;
    try {
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            // get the HPA TargetRef values
            hKind = vpk.hpaLinks[key][0].hpaLinkKind;
            hName = vpk.hpaLinks[key][0].hpaLinkName;
            found = false;
            for (let c = 0; c < chl; c++) {
                cKey = cKeys[c];
                found = false;
                if (typeof vpk.containers[cKey].creationChain !== 'undefined' ) {
                    if (vpk.containers[cKey].creationChain.level1Name === hName ) {
                        if (vpk.containers[cKey].creationChain.level1Kind === hKind ) {
                            found = true;
                        }
                    } 
                
                    if (vpk.containers[cKey].creationChain.level2Name === hName ) {
                        if (vpk.containers[cKey].creationChain.level2Kind === hKind ) {
                            found = true;
                        }
                    } 
 
                    if (found === true) {
                        vpk.containers[cKey].HPA = {
                            'fnum': vpk.hpaLinks[key][0].fnum, 
                            'spec': vpk.hpaLinks[key][0].spec
                        }
                    }
                }
            }        
        }
    } catch (err) {
        utl.logMsg('vpkSCM069 - Error processing HPA, message: ' + err );
        utl.logMsg('vpkSCM169 - Error: ' + err.stack);
    }
}

const populateServiceAccountSecrets = function() {
    let secKeys = Object.keys(vpk.secretFnum);
    let shl = secKeys.length;
    let fn;
    let fp;
    let fnum;
    let hl;
    let ns;
    let sourceRoot;
    let key;
    let already;
    try {
        keys = Object.keys(vpk.containers);
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            if (key.startsWith('0000') ) {
                continue;
            }
            if (typeof vpk.containers[key].ServiceAccount !== 'undefined') {
                if (typeof vpk.containers[key].ServiceAccount[0].source !== 'undefined') {
                    fn = vpk.containers[key].ServiceAccount[0].source;
                    fp = fn.indexOf('config');
                    sourceRoot = fn.substring(0, fp + 6);
                    fnum = fn.substring(fp + 6, fn.length - 5) + '.' + vpk.containers[key].ServiceAccount[0].part;
                    if (typeof vpk.serviceAccounts[fnum] !== 'undefined') {
                        
                        // check for ImagePullSecrets
                        if (typeof vpk.serviceAccounts[fnum][0].imagePullSecrets !== 'undefined') {
                            hl = vpk.serviceAccounts[fnum][0].imagePullSecrets.length
                            ns = vpk.serviceAccounts[fnum][0].namespace;
                            for (let s = 0; s < hl; s++) { 
                                if (typeof vpk.serviceAccounts[fnum][0].imagePullSecrets[s] !== 'undefined') {
                                    if (typeof vpk.serviceAccounts[fnum][0].imagePullSecrets[s].name !== 'undefined') {
                                        let secName = vpk.serviceAccounts[fnum][0].imagePullSecrets[s].name;
                                        for (let k = 0; k < shl; k++) {
                                            if (vpk.secretFnum[secKeys[k]][0].name === secName && vpk.secretFnum[secKeys[k]][0].namespace === ns) {
                                                let fPart = vpk.secretFnum[secKeys[k]][0].fnum
                                                let fParts = fPart.split('.');
                                                let newFName = sourceRoot + fParts[0] + '.yaml';
                                                let newPart = fParts[1];
                                                if (typeof vpk.containers[key].Secret === 'undefined') {
                                                    vpk.containers[key].Secret = [];
                                                }
                                                already = false;
                                                let work = vpk.containers[key].Secret
                                                let newName = vpk.secretFnum[secKeys[k]][0].name
                                                for  (let h = 0; h < work.length; h++) {
                                                    let item = work[h];
                                                    if (item.name !== newName) {
                                                        continue;
                                                    } else {
                                                        if (item.use !== 'ServiceAccount-ImagePull') {
                                                            continue;
                                                        } else {
                                                            already = true;
                                                            //console.log('skipped already there')
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (already === false) {
                                                    vpk.containers[key].Secret.push({
                                                        'name': vpk.secretFnum[secKeys[k]][0].name,
                                                        'use': 'ServiceAccount-ImagePull',
                                                        'source': newFName,
                                                        'part': newPart
                                                    })
                                                }
                                            }
                                        }
                                    } 
                                }
                            }
                        }

                        // check for Secrets
                        if (typeof vpk.serviceAccounts[fnum][0].secrets !== 'undefined') {
                            hl = vpk.serviceAccounts[fnum][0].secrets.length
                            ns = vpk.serviceAccounts[fnum][0].namespace;
                            for (let s = 0; s < hl; s++) { 
                                if (typeof vpk.serviceAccounts[fnum][0].secrets[s] !== 'undefined') {
                                    if (typeof vpk.serviceAccounts[fnum][0].secrets[s].name !== 'undefined') {
                                        let secName = vpk.serviceAccounts[fnum][0].secrets[s].name;
                                        for (let k = 0; k < shl; k++) {

                                            if (vpk.secretFnum[secKeys[k]][0].name === secName && vpk.secretFnum[secKeys[k]][0].namespace === ns) {
                                                let fPart = vpk.secretFnum[secKeys[k]][0].fnum
                                                let fParts = fPart.split('.');
                                                let newFName = sourceRoot + fParts[0] + '.yaml';
                                                let newPart = fParts[1];
                                                if (typeof vpk.containers[key].Secret === 'undefined') {
                                                    vpk.containers[key].Secret = [];
                                                }
                                                already = false;
                                                let work = vpk.containers[key].Secret
                                                let newName = vpk.secretFnum[secKeys[k]][0].name
                                                for  (let h = 0; h < work.length; h++) {
                                                    let item = work[h];
                                                    if (item.name !== newName) {
                                                        continue;
                                                    } else {
                                                        if (item.use !== 'ServiceAccount-Secret') {
                                                            continue;
                                                        } else {
                                                            already = true;
                                                            //console.log('skipped already there')
                                                            break;
                                                        }
                                                    }
                                                }

                                                if (already === false) {
                                                    vpk.containers[key].Secret.push({
                                                        'name': vpk.secretFnum[secKeys[k]][0].name,
                                                        'use': 'ServiceAccount-Secret',
                                                        'source': newFName,
                                                        'part': newPart
                                                })
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM052 - Error processing ServiceAccounts Secrets, message: ' + err );
        utl.logMsg('vpkSCM152 - Error: ' + err.stack);
    }
}

const populateControllerRevision = function() {
    let keys = Object.keys(vpk.controllerRevision);
    let key = '';
    let cKey = '';
    for (let k = 0; k < keys.length; k++) {
        key = keys[k];
        if (typeof vpk.controllerRevision[key][0].ownerUid !== 'undefined') {
            cKey = vpk.controllerRevision[key][0].ownerUid;

            // check the ownerUids 
            if (typeof vpk.ownerUids[cKey] !== 'undefined') {
                for (let h = 0; h < vpk.ownerUids[cKey].length; h++) {
                    if (vpk.ownerUids[cKey][h].selfKind === 'Pod') {
                        let pKey = vpk.ownerUids[cKey][h].selfFnum;

                        if (typeof vpk.containers[pKey] !== 'undefined') {
                            if (typeof vpk.containers[pKey]['ControllerRevision'] === 'undefined') {
                                vpk.containers[pKey]['ControllerRevision'] = [];
                            }
                            vpk.containers[pKey]['ControllerRevision'].push({
                                'name': vpk.controllerRevision[key][0].name,
                                'fnum': vpk.controllerRevision[key][0].fnum
                            })
                        }
                    }
                }
            } else {
                utl.logMsg('vpkSCM061 - Error processing ControllerRevision: ' + cKey + ' name: ' + vpk.controllerRevision[key][0].name);
            }
        }
    }
}

const populateRoleBinding = function() {
    let keys = Object.keys(vpk.roleBindingFnum);
    let key;
    let already;
    let roleCnt;
    for (let k = 0; k < keys.length; k++) {
        key = keys[k];
        let ns = vpk.roleBindingFnum[key][0].namespace;
        if (ns !== '') {
            if (typeof vpk.containers['0000-' + ns] === 'undefined') {
                vpk.containers['0000-' + ns] = {};
            }
            if (typeof vpk.containers['0000-' + ns]['RoleBinding'] === 'undefined') {
                vpk.containers['0000-' + ns].RoleBinding = [];
            }
            already = false;
            roleCnt = vpk.containers['0000-' + ns].RoleBinding.length;
            for (let r = 0; r < roleCnt; r++) {
                if (vpk.containers['0000-' + ns].RoleBinding[r].fnum === vpk.roleBindingFnum[key][0].fnum) {
                    already = true;
                    break;
                }
            }

            if (already === false) {
                vpk.containers['0000-' + ns].RoleBinding.push({
                    'name': vpk.roleBindingFnum[key][0].name,
                    'fnum': vpk.roleBindingFnum[key][0].fnum,
                    'namespace': ns,
                    'kind': 'RoleBinding',
                    'api': vpk.roleBindingFnum[key][0].api,
                    'roleRef': vpk.roleBindingFnum[key][0].roleRef,
                    'subjects': vpk.roleBindingFnum[key][0].subjects,
                    'userNames': vpk.roleBindingFnum[key][0].userNames
                });
            }
            //utl.usedFnum(vpk.roleBindingFnum[key][0].fnum, 'RoleBinding')
        }
    }
}

const populateClusterRoleBindingsAtNamespace = function() {
    let keys = Object.keys(vpk.clusterRoleBindingFnum);
    let crKeys = Object.keys(vpk.clusterRoleFnum);
    let rKeys = Object.keys(vpk.roleFnum);
    let key = '';
    let subs = ''
    let crb = '';
    let ns = ''
    let roleRefFnum = '';
    let roleRefName = '';
    try {
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];
            crb = vpk.clusterRoleBindingFnum[key][0];
            roleRefName = crb.roleRef.name;
            roleRefFnum = 'unknown';
            if (crb.roleRef.kind === 'ClusterRole') {
                for (let cr = 0; cr < crKeys.length; cr++) {
                    if (vpk.clusterRoleFnum[crKeys[cr]][0].name === roleRefName ){
                        roleRefFnum = crKeys[cr];
                        break;
                    }
                }
            } else if (crb.roleRef.kind === 'Role') {
                for (let r = 0; r < rKeys.length; r++) {
                    if (vpk.roleFnum[rKeys[r]][0].name === roleRefName ){
                        roleRefFnum = rKeys[r];
                        break;
                    }
                }
            } 
            if (typeof crb.subjects !== 'undefined') {
                subs = crb.subjects;
                for (let s = 0; s < subs.length; s++) {
                    if (typeof subs[s].namespace !== 'undefined') {
                        ns = '0000-' + subs[s].namespace;
                        if (typeof vpk.containers[ns] === 'undefined') {
                            utl.logMsg('vpkSCM851 - CRB process found missing namespace: ' + ns + ' fnum: ' + key );
                            continue;
                        }

                        if (typeof vpk.containers[ns].CRB === 'undefined') {
                            vpk.containers[ns].CRB = [];
                        }
                        vpk.containers[ns].CRB.push({
                            'crbName': crb.name,
                            'crbFnum': crb.fnum,
                            'roleRefName': roleRefName,
                            'roleRefFnum': roleRefFnum,
                            'roleRefKind': crb.roleRef.kind,
                            'subName': subs[s].name,
                            'subKind': subs[s].kind
                        });
                    }
                }
            } else {
                utl.logMsg('vpkSCM852 - CRB does not have subjects, fnum: ' + crb.fnum );
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM853 - Error processing CRB for namespace, message: ' + err );
        utl.logMsg('vpkSCM854 - Error: ' + err.stack);
    } 
}

const populateEndpoints = function() {
    let ckeys = Object.keys(vpk.containers);
    let ekeys = Object.keys(vpk.endpointsLinks);
    let ckey;
    let ekey;
    let sName;
    let fp;
    let cFnum;
    let srcFile;
    let srcPart;
    try {
        // loop containers
        for (let c = 0; c < ckeys.length; c++) {
            ckey = ckeys[c];
            if (typeof vpk.containers[ckey].Services !== 'undefined') {
                sName = vpk.containers[ckey].Services[0].name;
                for (let e = 0; e < ekeys.length; e++) {
                    ekey = ekeys[e];
                    if (typeof vpk.endpointsLinks[ekey] !== 'undefined') {
                        if (typeof vpk.endpointsLinks[ekey][0].name !== 'undefined') {
                            if (vpk.endpointsLinks[ekey][0].name === sName) {
                                vpk.containers[ckey].Services[0].ep = ekey;

                                srcFile = vpk.endpointsLinks[ekey][0].source;
                                srcPart = vpk.endpointsLinks[ekey][0].part;
                                fp = srcFile.indexOf('config');
                                cFnum = srcFile.substring(fp + 6, srcFile.length - 5) + '.' + srcPart;
                                //utl.usedFnum(cFnum, 'EP');
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM032 - Error processing schematic, message: ' + err.stack);
    }   
}

const populateEndpointSlice = function() {
    let ckeys = Object.keys(vpk.containers);
    let ekeys = Object.keys(vpk.endpointSliceService);
    let ckey;
    let ekey;
    let eFnum;
    let pName;
    let lName;
    try {
        for (let e = 0; e < ekeys.length; e++) {
            ekey = ekeys[e];
            pName = vpk.endpointSliceService[ekey][0].targetName;
            eFnum = vpk.endpointSliceService[ekey][0].fnum;
            lName = vpk.endpointSliceService[ekey][0].labelServiceName;
            //utl.usedFnum(eFnum, 'EPS');

            if (pName === '') {
                for (let c = 0; c < ckeys.length; c++) {
                    ckey = ckeys[c];
                    if (typeof vpk.containers[ckey].Services !== 'undefined') {
                        if (typeof vpk.containers[ckey].Services[0] !== 'undefined') {
                            if (typeof vpk.containers[ckey].Services[0].name !== 'undefined') {
                                if (vpk.containers[ckey].Services[0].name === lName) {
                                    vpk.containers[ckey].Services[0].eps = eFnum;
                                }
                            }
                        }
                    }
                }
            } else {
                for (let c = 0; c < ckeys.length; c++) {
                    ckey = ckeys[c];
                    if (vpk.containers[ckey].name ===  pName ) {
                        if (typeof vpk.containers[ckey].Services !== 'undefined') {
                            vpk.containers[ckey].Services[0].eps = eFnum;
                        }
                    }
                }
            }
        }
    } catch (err) {
        utl.logMsg('vpkSCM033 - Error processing schematic, message: ' + err.stack );
    }
}

const populateServices = function() {
    let keys = Object.keys(vpk.serviceLabels);
    let key;
    let fnum;
    let labels;
    try {
        for (let k = 0; k < keys.length; k++) {
            key = keys[k];  // the service spec.selector.label
            fnum = '';
            if (typeof vpk.labelKeys[key] !== 'undefined') {
            
                labels = vpk.labelKeys[key];
                for (let j = 0; j < labels.length; j++) {
                    fnum = labels[j];
                    if (typeof vpk.containers[fnum] !== 'undefined') {
                        if (typeof vpk.containers[fnum].Services === 'undefined') {
                            vpk.containers[fnum].Services = [];
                        }
                        let push = true;
                        for (let p = 0; p < vpk.containers[fnum].Services.length; p++) {
                            if (vpk.containers[fnum].Services[p].fnum === vpk.serviceLabels[key][0].fnum) {
                                push = false;
                                break;
                            }
                        }
                        if (push === true) {
                            vpk.containers[fnum].Services.push({
                                'fnum': vpk.serviceLabels[key][0].fnum,
                                'label': key, 
                                'name': vpk.serviceLabels[key][0].name, 
                                'namespace': vpk.serviceLabels[key][0].namespace,
                                'ep': '',
                                'eps': '',
                                'type': vpk.serviceLabels[key][0].type
                            });
                            //utl.usedFnum(vpk.serviceLabels[key][0].fnum, 'Network');
                        }
                    }
                }
            } else {
                utl.logMsg('vpkSCM234 - Unable to locate labelKey key: ' + key + ' fnum: ' + fnum);
            }
        }
    } catch (err) {
        if (typeof fnum === 'undefined') {
            fnum = ''
        }
        utl.logMsg('vpkSCM034 -  Error populating service for key: ' + key + ' fnum: ' + fnum);
        utl.logMsg('vpkSCM134 -  Error: ' + err.stack);
        console.log(err.stack)
    }
}

const populateContainer = function(container, fnum)  {
    if (typeof container === 'undefined') {
        console.log('check this out')
    }
    container = checkType(container, 'Secret', fnum);
    container = checkType(container, 'ConfigMap', fnum);
    container = checkType(container, 'PersistentVolumeClaim', fnum);
    container = checkType(container, 'ServiceAccount', fnum);
    container = checkEvents(container);
};

const checkEvents = function(container) {
    let key = container.kind+'.'+container.namespace+'.'+container.name;
    let events = [];
    let hl = vpk.eventMessage.length;
    for (let e = 0; e < hl; e++) {
        if (vpk.eventMessage[e].key === key) {
            events.push(vpk.eventMessage[e]);
            vpk.eventMessage[e].used = true;
            //utl.usedFnum(vpk.eventMessage[e].fnum, 'Event');
        }
    }
    container.Events = events;
}

const checkType = function (container, type, fnum) {
    let srcFile;
    let srcPart;
    let i;
    let name;
    let key;
    let fp;
    let cFnum;
    try {
        if (typeof container[type] !== 'undefined') {
            for (i = 0; i < container[type].length; i++) {
                name = container[type][i].name;
                key = container.namespace + '.' + type + '.' + name;
                if (typeof vpk[type] !== 'undefined') {
                    if (typeof vpk[type][key] !== 'undefined') {
                        if (typeof vpk[type][key][0] !== 'undefined') {
                            if (typeof vpk[type][key][0].sourceFile !== 'undefined') {
                                srcFile =  vpk[type][key][0].sourceFile
                            } else {
                                srcFile = 'Missing source file'
                            }
                            if (typeof vpk[type][key][0].sourcePart !== 'undefined') {
                                srcPart =  vpk[type][key][0].sourcePart
                            } else {
                                srcPart = 0;
                            }
                            container[type][i].source = srcFile;
                            container[type][i].part = srcPart;

                            fp = srcFile.indexOf('config');
                            cFnum = srcFile.substring(fp + 6, srcFile.length - 5) + '.' + srcPart;
                            //utl.usedFnum(cFnum, type);
                        }
                    }else {
                        //utl.logMsg('VpKSCM427 - Container fnum: ' + fnum + ' flagged not found for: ' + type + '  key: ' + key)
                        container[type][i].notFound = true;
                        container[type][i].source = 'Missing source file';
                        container[type][i].part = '<nf>';
                    }
                } else {
                    utl.logMsg('VpKSCM428 - Fnum: ' + fnum + ' did not locate vpk.' + type + ' for key: ' + key)
                }
            }
        } 
    } catch(err) {
        utl.logMsg('vpkSCM035 -  Error fnum ' + fnum + ' container type: ' + type + ' at entry: ' + i + ' using key (namespace.kind.name): ' + key);
        utl.logMsg('vpkSCM135 -  Error: ' + err.stack);
    }
    return container;   
}

// const putMsg = function(msg, type, container) {
//     vpk.svgMsg.push({'message': msg, 'type': type, 'containerFnum': container})
//     //utl.logMsg('vpkSCM320 - ' + msg + '  Type: ' + type + '  Workload reference file number: fnum: ' + container);
// }


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(idata) {
        // if (vpk.schematicBuilt === true ) {
        //     return;
        // } else {
        //     vpk.schematicBuilt = true;
        // }
        parseSchematic(idata);

        // let src;
        // let part;
        // let fp;
        // let fnum;
        // let uCnt = 0;
        // let nCnt = 0;
        // let name = '';
        // for (let e = 0; e < data.length; e++) {
        //     src = data[e].src;
        //     part = data[e].part;
        //     fp = src.indexOf('config');
        //     fnum = src.substring(fp + 6, src.length - 5) + '.' + part;
        //     if (typeof vpk.fnumUsed[fnum] === 'undefined') {
        //         if (typeof data[e].value !== 'undefined') {
        //             name = data[e].value;
        //         } else if (typeof data[e].name !== 'undefined') {
        //             name = data[e].name;
        //         } else {
        //             name = 'Unknown';
        //         }
        //         //utl.logMsg('vpkSCM036 - fnum: ' + fnum + '    kind: ' + data[e].kind + ' namespace: ' + data[e].namespace + ' name: ' + name )
        //         uCnt++
        //         if (data[e].namespace !== '') {
        //             nCnt++
        //         }
        //     }
        // }
        // utl.logMsg('vpkSCM037 - Count of namespaced resources not used : ' + uCnt)
        // utl.logMsg('vpkSCM038 - Count of clusterLevel resources not used: ' + nCnt)

        return;
    }
};

