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

/*----------------------------------------------------------

Common utility functions

*/
'use strict';

var vpk = require('../lib/vpk');
var Q = require('q');
var fs = require('fs');
var YAML = require('js-yaml');
var fsPath = require('path');


var logIt = function(msg) {
    var output = new Date().toLocaleString() + ' :: ' + msg;
    //vpk.vpkLogMsg.push(output);
    console.log(output);
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------


module.exports = {

    //------------------------------------------------------------------------------
    // build the entry to for the specific item  
    //------------------------------------------------------------------------------
    bldEntry: function(evt, kind, ns, name, src, part, x, y, h, w, id) {
        var entry = {
            'evt': evt,
            'id:': id,
            'x': x,
            'y': y,
            'h': h,
            'w': w,
            'kind': kind,
            'ns': ns,
            'name': name,
            'src': src,
            'part': part
        };
        return entry;
    },


    //------------------------------------------------------------------------------
    // check if namespace is in array 
    //------------------------------------------------------------------------------
    checkDefinedNamespace: function(ns) {
        // if this namespace does not exist add it
        if (typeof vpk.definedNamespaces[ns] === 'undefined') {
            vpk.definedNamespaces[ns] = ns;
        }
    },
 

    //------------------------------------------------------------------------------
    // check if kind/type is in array 
    //------------------------------------------------------------------------------
    checkKind: function(kind, qual) {
        // if this type of kind does not exist create one
        if (typeof qual !== 'undefined' && qual !== null) {
        	kind = kind + ' (' + qual + ')';
        }
        if (typeof vpk.kinds[kind] === 'undefined') {
            vpk.kinds[kind] = kind;
        }
    },


    //------------------------------------------------------------------------------
    // check if label is in array 
    //------------------------------------------------------------------------------
    checkLabel: function(label, value, src, part) {
        var fp = src.indexOf('config');
        var fnum = src.substring(fp + 6, src.length - 5) + '.' + part;
        value = value.trim();
        label = label.trim()
        try {
        if (typeof vpk.labelKeys[label+': '+value] === 'undefined') {
            vpk.labelKeys[label+': '+value] = [];
            vpk.labelKeys[label+': '+value].push(fnum);
        } else {
            var key = label+': '+value;
            var tmp = vpk.labelKeys[key];
            var add = true;
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i] === fnum) {
                    add = false;
                }
            } 
            if (add === true) {
                tmp.push(fnum)
                vpk.labelKeys[label+': '+value] = tmp
            }
        }
        } catch (err) {
            logIt('vpkUTL099 - Error checking labels , message: ' + err);
        
        }
    },


    checkType: function(kind, key) {
        if (typeof vpk[kind] === 'undefined') {
            vpk[kind] = [];
            // // add to genericType
            // var ctype = vpk.genericType;
            // if (ctype.indexOf(':'+kind+':') === -1) {
            //     vpk.genericType = vpk.genericType + kind + ':';
            // }
            // add to cntId 
            var tmp = vpk.kindList;
            if (tmp.indexOf('::' + kind + '::') === -1) {
                vpk.kindList = vpk.kindList + '::' + kind;
            }
        }
        
        if (typeof key === 'number') {
            key = '' + key;
        }
        if (key.length > 0) {
            // add key if not defined
            if (typeof vpk[kind][key] === 'undefined') {
                vpk[kind][key] = [];
            }   
        }
    },


    //------------------------------------------------------------------------------
    // combine data for two arrays 
    //------------------------------------------------------------------------------
    combineData: function(data, tmp) {
        if (typeof tmp !== 'undefined') {
            if (tmp !== null && tmp.length > 0) {
                for (var e = 0; e < tmp.length; e++) {
                    data.push(tmp[e]);
                }
            }
        }
        return data;
    },


    //------------------------------------------------------------------------------
    // container related
    //------------------------------------------------------------------------------
    containerLink: function(fnum, type, key, name, whereUsed) {
        //type = type.toUpperCase();
        if (typeof vpk.containers[fnum][type] === 'undefined') {
            vpk.containers[fnum][type] = [];
        }
        if (type === 'Secret' || type === 'ConfigMap') {
            if (typeof whereUsed === 'undefined') {
                whereUsed = 'Not provided'
                console.log('============ ' + fnum)
            }
            // check if reference is already added
            let tmp = vpk.containers[fnum][type];
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].name === name) {
                    if (tmp[i].use === whereUsed) {
                        return
                    }
                }
            }
            vpk.containers[fnum][type].push({'name': name, 'use': whereUsed } )

        } else {
            vpk.containers[fnum][type].push({'name': name } )
        }
    },


    //------------------------------------------------------------------------------
    // count of the resource files by kind, namespace, and name
    //------------------------------------------------------------------------------
    count: function(kind, ns, fnum) {
        let total = '_total';
        if (typeof vpk.fileCnt[total] === 'undefined') {
            vpk.fileCnt[total] = {'_cnt': 1}
        } else {
            vpk.fileCnt[total]._cnt = vpk.fileCnt[total]._cnt + 1;
        }

        if (typeof vpk.fileCnt[kind] === 'undefined') {
            vpk.fileCnt[kind] = {'_cnt': 1}
        } else {
            vpk.fileCnt[kind]._cnt = vpk.fileCnt[kind]._cnt + 1;
        }

        if (typeof vpk.fileCnt[kind][ns] === 'undefined') {
            vpk.fileCnt[kind][ns] = 1
        } else {
            vpk.fileCnt[kind][ns] = vpk.fileCnt[kind][ns] + 1;
        }

        // count of kinds by namespace
        if (typeof vpk.namespaceCnt[ns] === 'undefined') {
            vpk.namespaceCnt[ns] = {'_cnt': 1}
        } else {
            vpk.namespaceCnt[ns]._cnt = vpk.namespaceCnt[ns]._cnt + 1;
        }

        if (typeof vpk.namespaceCnt[ns][kind] === 'undefined') {
            vpk.namespaceCnt[ns][kind] = 1;
        } else {
            vpk.namespaceCnt[ns][kind] = vpk.namespaceCnt[ns][kind] + 1;
        }


    },


    //------------------------------------------------------------------------------
    // add to kind/type counter
    //------------------------------------------------------------------------------
    countKind: function(kind) {
        // create and increment kind counter
        var countId = kind + 'Cnt'
        if (typeof vpk[countId] === 'undefined') {
            vpk[countId] = {'id': kind, 'count': 1};
        } else {
            var tCnt = vpk[countId];
            var count = tCnt.count;
            count++;
            vpk[countId] = {'id': kind, 'count': count}
        }
    },


    //------------------------------------------------------------------------------
    // read cluster directory
    //------------------------------------------------------------------------------
    getClusterDir: function() {
        var cwd = process.cwd();
        var dirs = [];
        var content;
        var item;
        var path
        try {
            content = fs.readdirSync(cwd+'/cluster');
            for (var i = 0; i < content.length; i++) {
                // build file name to process
                item = fsPath.join(cwd+'/cluster', content[i]);
                // is this item a directory
                if (fs.statSync(item).isDirectory() ) {
                    dirs.push(item)
                }
            }
        } catch (err) {
            logIt('vpkUTL056 - Error reading cluster directory, message: ' + err);
        }
        return dirs;
    },


    //------------------------------------------------------------------------------
    // check if namespace is in array 
    //------------------------------------------------------------------------------
    logMsg: function(msg, component) {
        // second parameter of component is no longer used 
        // var output = new Date().toLocaleString() + ' :: ' + component + ' :: ' + msg;
        var output = new Date().toLocaleString() + ' :: ' + msg;
        //vpk.vpkLogMsg.push(output);
        console.log(output);
    },
    

    //------------------------------------------------------------------------------
    // check if namespace is in array 
    //------------------------------------------------------------------------------
    dirDate: function() {
        var dStr = new Date().toISOString();
        var fp;
        fp = dStr.indexOf('T');
        if (fp > -1) {
            dStr = dStr.substring(0,fp) + '-' + dStr.substring(fp + 1);
        }
        fp = dStr.indexOf(':');
        if (fp > -1) {
            dStr = dStr.substring(0,fp) + 'h-' + dStr.substring(fp + 1);
        }
        fp = dStr.indexOf(':');
        if (fp > -1) {
            dStr = dStr.substring(0,fp) + 'm-' + dStr.substring(fp + 1);
        }

        fp = dStr.indexOf('.');
        if (fp > -1) {
            dStr = dStr.substring(0,fp) + 's';
        }
        return dStr;
    },



    //------------------------------------------------------------------------------
    // read configuration file
    //------------------------------------------------------------------------------
    readConfig: function(fn) {
        var status = 'OK';
        try {
            var contents = fs.readFileSync('./'+ fn, "utf8");
            if (contents !== '') {
                // populate vpk object with config parms
                try {
                    if (fn === 'vpkconfig.json')  {
                        //build JSON from config file
                        vpk.configFile = JSON.parse(contents);
                        //populate the providers
                        var prov = vpk.configFile.providers
                        var hl = prov.length;
                        vpk.providers = [];
                        for (var p = 0; p < hl; p++) {
                            vpk.providers.push({"name": prov[p].name, "dropdown": prov[p].dropdown, "fields": prov[p].authCmd})
                        }
                    } else if (fn === 'userconfig.json') {
                        // get user config and add to global config
                        var userConfig = JSON.parse(contents);
                        if (typeof userConfig.xrefNames !== 'undefined') {
                            vpk.configFile.xrefNames = userConfig.xrefNames;
                        } else {
                            vpk.configFile.xrefNames = {};
                        }
                        if (typeof userConfig.xrefRules !== 'undefined') {
                            vpk.configFile.xrefRules = userConfig.xrefRules;
                        } else {
                            vpk.configFile.xrefRules = {};
                        }
                        //populate the default settings
                        if (typeof userConfig.defaults === 'undefined') {
                            vpk.configFile.defaults = {};
                            vpk.configFile.defaults.managedFields = false;
                            vpk.configFile.defaults.statusSection = false;
                            vpk.defaultSettings = vpk.configFile.defaults;
                        } else {
                            vpk.configFile.defaults = userConfig.defaults;
                            vpk.defaultSettings = vpk.configFile.defaults;
                        }
                    }
                    status = 'OK';
                } catch (e) {
                    logIt('vpkUTL055 - VPK config file: ' + fn + ' has invalid format, message: ' + e );
                    status = 'FAIL';
                }
            }

        } catch (err) {
            if (err.code === 'ENOENT') {
                logIt('vpkUTL052 - VPK config file: ' + fn + ' does not exist, creating file');
                if (fn === 'userconfig.json') {
                    vpk.configFile.xrefNames = {};
                    vpk.configFile.xrefRules = {};
                    vpk.configFile.defaults = {};
                    vpk.configFile.defaults.managedFields = false;
                    vpk.configFile.defaults.statusSection = false;
                    this.saveConfigFile();
                }
                status = 'BUILD';
            } else if (err.code === 'EACCES') {
                logIt('vpkUTL053 - VPK config file: ' + fn + ' has Permission error(s)' );
                status = 'FAIL';
            } else {
                logIt('vpkUTL054 - VPK config file: ' + fn + ' has Unknown Error(s)' );
                status = 'FAIL';
            }
        }
        return status;
    },

    //---
    // reset the vpk object
    //---
    resetVpkObject: function() {
        // clean up any old kinds in vpk object
        var totId = vpk.kindList.split('::');
        var cCnt = 0;
        if (totId.length > 0) {
            for (var c = 0; c < totId.length; c++) {
                var kind = totId[c];
                kind = kind.trim();

                if (kind.length > 0) {

                    if (typeof vpk[kind] !== 'undefined') {

                        var keys = Object.keys(vpk[kind]);
                        for (var i = 0; i < keys.length; i++) { 
                            var key = keys[i]
                            var hl = vpk[kind][key].length;
                            for (var d = 0; d < hl; d++ ) {
                                vpk[kind][key].pop();
                                if (vpk[kind][key].length === hl) {
                                }
                            }
                            delete vpk[kind][key]
                        }
                        delete vpk[kind];
                        
                        cCnt++;
                        delete vpk.kinds[kind];

                        var chkCntId = kind + 'Cnt'
                        if (typeof vpk[chkCntId] !== 'undefined') {
                            delete vpk[chkCntId];
                        }
                    }
                }
            }
            logIt('vpkUTL694 - Reset ' + cCnt + ' vpk. objects');
        }
        vpk.kindList = '';
    }, 

    //------------------------------------------------------------------------------
    // save vpkconfig.json file
    //------------------------------------------------------------------------------
    processExplains: function() {
        if (vpk.dirname === '') {
            return;
        }
        let fn = vpk.dirname + '/explains.json';
        let found = false;
        try {
            if (fs.existsSync(fn)) {
                found = true;
            } 
            if (found) {
                //
                let content = fs.readFileSync(fn);
                content = content.toString();
                content = JSON.parse(content);
                vpk.explains = content;
                logIt('vpkUTL373 - Explains loaded');
                return;
            }
        } catch(err) {
            logIt('vpkUT374 - Failed to read : ' + fn + ' message: ' + err);
            return;
        }

        if (typeof vpk.explains !== 'undefined') {
            try {
                let keys = Object.keys(vpk.explains);
                let doc = '';
                if (keys.length > 0) {
                    doc = JSON.stringify(vpk.explains)
                    fs.writeFileSync(fn, doc);
                    logIt('vpkUT373 - Created explains file: ' + fn );
                }
            } catch (e) {
                logIt('vpkUT375 - Error saving file: ' + fn + ' message: ' + e);
            }
        } else {
            logIt('vpkUT376 - No vpk.explains available to save');
            return;
        }
    },    


    //------------------------------------------------------------------------------
    // save edited K8 resource yaml file
    //------------------------------------------------------------------------------
    saveEditFile: function(fn, content) {
        if (typeof fn !== 'undefined') {
            if (typeof content !== 'undefined') {
                try {
                    var doc = YAML.safeLoad(content);
                    doc = JSON.stringify(doc, null, 4);
                    fs.writeFileSync(fn, doc);
                    return {"status": "PASS", "message": "Successfully saved file: " + fn};;
                } catch (e) {
                    logIt('vpkUT084 - Error saving file: ' + fn + ' message: ' + e);
                    return {"status": "FAIL", "message": "Failed saving file: " + fn + " message: " + e};
                }
            } else {
                logIt('vpkUT086 - No file content provided for save');
                return {"status": "FAIL", "message": "No file content provided for save"};
            }
        } else {
            logIt('vpkUT085 - No filename provided for save');
            return {"status": "FAIL", "message": "No filename provided for save"};
        }
    },    

    //------------------------------------------------------------------------------
    // save the yaml file contents
    //------------------------------------------------------------------------------
    saveFileContents: function(fn, part, yaml, y_kind, y_name, y_ns, y_uid, fnum) {
        let dkey = y_kind + ':' + y_name + ':' + y_ns + ':' + y_uid;
        if (typeof vpk.fileContentKeys[dkey] === 'undefined') {
            vpk.fileContentKeys[dkey] = fnum;
        } else {
            // console.log('dup: ' + dkey )
            if (typeof vpk.fileDupKeys[dkey] === 'undefined') {
                vpk.fileDupKeys[dkey] = {'baseFnum': vpk.fileContentKeys[dkey], 'dupFnum': fnum };
            } else {
                logIt('vpkUT985 - Triplicate located ' + key + ' fnum: ' + fnum)
            }
            return
        }

        // save file content
        var key = fn + '::' + part;
        vpk.fileContent[key] = [];

        var content = {
            'sourceFile': fn,
            'part': part,
            'content': yaml
        };
        vpk.fileContentCnt++;
        vpk.fileContent[key].push(content);
        return true;
    }, 

    //------------------------------------------------------------------------------
    // save the yaml file name
    //------------------------------------------------------------------------------
    saveFileName: function(fn, fnum) {
        // save file name info
        if (typeof vpk.fileNames[fnum] === 'undefined') {
            vpk.fileNames[fnum] = fn;
        }
    },     
    
    //---
    // show object properties
    //---    
    showProps: function(obj, objName) {
        var result = ``;
        for (var i in obj) {
            // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
            if (obj.hasOwnProperty(i)) {
                result += `${objName}.${i} = ${obj[i]}\n`;
            }
        }
        return result;
    },
 
    //------------------------------------------------------------------------------
    // save the user config file contents
    //------------------------------------------------------------------------------
    saveConfigFile: function(data) {
        let fn = process.cwd() + '/userconfig.json';
        try {
            if (typeof data !== 'undefined') {
                if (typeof data.managedFields !== 'undefined') {
                    vpk.configFile.defaults.managedFields = data.managedFields;
                }
                if (typeof data.statusSection !== 'undefined') {
                    vpk.configFile.defaults.statusSection = data.statusSection;
                }
                if (typeof data.xrefData !== 'undefined') {
                    if (typeof data.xrefData.names !== 'undefined') {
                        vpk.configFile.xrefNames = data.xrefData.names;
                    }
                    if (typeof data.xrefData.rules !== 'undefined') {
                        vpk.configFile.xrefRules = data.xrefData.rules;
                    }
                }
            }
            var doc = {
                'defaults': vpk.configFile.defaults,
                'xrefNames': vpk.configFile.xrefNames,
                'xrefRules': vpk.configFile.xrefRules
            };
            doc = JSON.stringify(doc, null, 4);
            fs.writeFileSync(fn, doc);
            return {"status": "PASS", "message": "Successfully saved "};
        } catch (e) {
            logIt('vpkUT484 - Error saving user configuration file, message: ' + e);
            return {"status": "FAIL", "message": "Failed saving: " + fn + " message: " + e};
        }
    }
    
//end of export    
};