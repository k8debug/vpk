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
Parse volume claim template
*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
var hierarchy = require('../lib/hierarchy');

//------------------------------------------------------------------------------
var parseVolumeClaimTemplates = function(ns, kind, name, obj, yk, fnum) {

    try {
        var storClass = ' ';
        var vctName;
        var v;
        var tmp;
        var item;
        var xkey;
        
        for (v = 0; v < obj.length; v++) {
            if (typeof obj[v].spec !== 'undefined') {
                if (typeof obj[v].spec.storageClassName !== 'undefined') {
                    storClass = obj[v].spec.storageClassName;
                } else {
                    storClass = ' ';
                }
            }

            if (typeof obj[v].metadata !== 'undefined') {
                if (typeof obj[v].metadata.name !== 'undefined') {
                    vctName = obj[v].metadata.name;
                } else {
                    vctName = 'unknown';
                }
            }

            var lkey = ns + '.' + kind + '.' + vctName;
            utl.checkType('VolumeClaimTemplates', '');

            // add the information to cluster hierarchy
            hierarchy.addEntry(ns, yk, name, fnum, 'VolumeClaimTemplates', vctName )
            utl.containerLink(fnum, 'VolumeClaimTemplates', vctName)
            

            if (typeof vpk['VolumeClaimTemplates'][lkey] === 'undefined') {
                vpk['VolumeClaimTemplates'][lkey] = [];

                tmp = vpk['VolumeClaimTemplates'][lkey];
                item = {
                    'namespace': ns,
                    'kind': kind,
                    'objName': vctName,
                    'storageClassName': storClass,
                    'fnum': fnum
                };
                tmp.push(item);
                vpk['VolumeClaimTemplates'][lkey] = tmp;
                utl.checkKind('VolumeClaimTemplates','U');
            } 
            

            // xref volumeClaimTemplates
            xkey = ns + '.' + vctName;
            utl.checkType('VolumeClaimTemplatesUse', '');
            if (typeof vpk['VolumeClaimTemplatesUse'][xkey] === 'undefined') {
                vpk['VolumeClaimTemplatesUse'][xkey] = [];
            }
            tmp = vpk['VolumeClaimTemplatesUse'][xkey];
            item = {
                'namespace': ns,
                'kind': yk,
                'objName': name,
                'storgeClass': storClass,
                'fnum': fnum
            };
            tmp.push(item);
            vpk['VolumeClaimTemplatesUse'][xkey] = tmp;
            utl.checkKind('VolumeClaimTemplatesUse','U');
            //utl.countKin_d('VolumeClaimTemplatesUse');

            // storage class use
            if (storClass !== ' ') {
                // xref storage class
                xkey = ns + '.' + storClass;
                utl.checkType('StorageClassUse', '');
                if (typeof vpk['StorageClassUse'][xkey] === 'undefined') {
                    vpk['StorageClassUse'][xkey] = [];
                }
                tmp = vpk['StorageClassUse'][xkey];
                item = {
                    'namespace': ns,
                    'kind': yk,
                    'objName': name,
                    'storgeClass': storClass,
                    'fnum': fnum
                };
                tmp.push(item);
                vpk['StorageClassUse'][xkey] = tmp;
                utl.checkKind('StorageClassUse','U');
            }

            // storage class name
            if (storClass !== ' ') {
                // xref storage class
                xkey = ns + '.' + 'StorageClass' + '.' + storClass;
                utl.checkType('StorageClass', '');
                if (typeof vpk['StorageClass'][xkey] === 'undefined') {
                    vpk['StorageClass'][xkey] = [];
                }
                tmp = vpk['StorageClass'][xkey];
                item = {
                    'namespace': ns,
                    'kind': 'StorageClass',
                    'objName': storClass,
                    'fnum': fnum
                };
                tmp.push(item);

                // add the information to cluster hierarchy
                hierarchy.addEntry(ns, yk, name, fnum, 'VolumeClaimTemplates', vctName , 'StorageClass', storClass)
                utl.containerLink(fnum, 'StorageClass', storClass)

                vpk['StorageClass'][xkey] = tmp;
                utl.checkKind('StorageClass','U');
            }
        }

    } catch (err) {
        utl.logMsg('vpkVCT001 - Error processing file fnum: ' + fnum + ' message: ' + err );
        utl.logMsg('vpkVCT001 - Stack: ' + err.stack);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, yk, fnum) {
        parseVolumeClaimTemplates(ns, kind, name, obj, yk, fnum);
    }
};