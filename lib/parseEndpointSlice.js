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

/*------------------------------------------------------------------------------*/

var vpk = require('./vpk');
var utl = require('./utl');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseEndpointSlice = function(ns, y_kind, name, obj, src, part, fnum) { 
    
    try {
        let tRef;
        let tName = '';
        let tKind = '';
        let tNamespace = '';
        let tUid = '';
        let oName = '';
        let oUid = '';
        let oKind = '';
        if (typeof obj.endpoints !== 'undefined') {
            if (obj.endpoints !== null) {
                if (typeof obj.endpoints[0] !== 'undefined') {
                    if (typeof obj.endpoints[0].targetRef !== 'undefined') {
                        tRef = obj.endpoints[0].targetRef;
                        if (typeof tRef.name !== 'undefined') {
                            tName = tRef.name
                        }
                        if (typeof tRef.namespace !== 'undefined') {
                            tNamespace = tRef.namespace
                        }
                        if (typeof tRef.kind !== 'undefined') {
                            tKind = tRef.kind
                        }
                        if (typeof tRef.uid !== 'undefined') {
                            tUid = tRef.uid
                        }
                    }
                }
            } else {
                utl.logMsg('vpkEPS004 - EndpointSlice endpoints is undefined for fnum: ' + fnum + ' part: ' + part + ' ns: ' + ns) ;
                tname = '<blank>';
                tNamespace = '<blank>';
                tKind = '<blank>';
                tUid = '<blank>'
            }
        }

        if (typeof obj.metadata.ownerReferences !== 'undefined') {
            if (typeof obj.metadata.ownerReferences[0].name !== 'undefined') {
                oName = obj.metadata.ownerReferences[0].name;
            }
            if (typeof obj.metadata.ownerReferences[0].uid !== 'undefined') {
                oUid = obj.metadata.ownerReferences[0].uid;
            }
            if (typeof obj.metadata.ownerReferences[0].kind !== 'undefined') {
                oKind = obj.metadata.ownerReferences[0].kind;
            }
        }

        if (typeof obj.metadata.labels !== 'undefined') {
            if (typeof obj.metadata.labels['kubernetes.io/service-name'] !== 'undefined') {
                labelServiceName = obj.metadata.labels['kubernetes.io/service-name'];
            }
        }


        if (typeof vpk.endpointSliceService[name] === 'undefined') {
            vpk.endpointSliceService[name] = [];
        }
        vpk.endpointSliceService[name].push({
            'source': src, 
            'part': part,
            'fnum': fnum, 
            'targetName': tName,
            'targetKind': tKind,
            'targetUid': tUid,
            'targetNamespace': tNamespace,
            'ownerName': oName,
            'ownerUid': oUid,
            'ownerKind': oKind,
            'labelServiceName': labelServiceName
        });

       
    } catch (err) {
        utl.logMsg('vpkEPS001 - Error processing file: ' + src + ' part: ' + part +  ' kind: ' + y_kind + ' message: ' + err);
    }
};




//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {
    parse: function(ns, kind, name, obj, src, part, fnum) {
        parseEndpointSlice(ns, kind, name, obj, src, part, fnum);
    }
};