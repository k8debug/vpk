/*
Copyright (c) 2018-2021 K8Debug

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
Parse the custom resource definition 
*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
var parseCRD = function(ns, kind, name, obj, fnum) { 
    try {
        if (typeof obj.spec !== 'undefined') {
            if (typeof obj.spec.names !== 'undefined') {
                if (typeof obj.spec.names.kind !== 'undefined') {

                    if (typeof vpk.crds[obj.spec.names.kind] === 'undefined') {
                        vpk.crds[obj.spec.names.kind] = [];
                    }
                    vpk.crds[obj.spec.names.kind].push({
                        
                        'fnum': fnum, 
                        'name': name, 
                        'crdKind': obj.spec.names.kind,
                        'crdScope': obj.spec.names.scope,
                        'namespace': ns
                    });
                }   
            }         
        }
    } catch (err) {
        utl.logMsg('vpkCRD001 - Error processing file fnum: ' + fnum +  ' kind: ' + kind + ' message: ' + err);
        utl.logMsg('vpkCRD001 - Stack: ' + err.stack);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {
    parse: function(ns, kind, name, obj, fnum) {
        parseCRD(ns, kind, name, obj, fnum);
    }
};
