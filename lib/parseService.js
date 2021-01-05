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
Service is a named abstraction of software service (for example, mysql) consisting of local port 
(for example 3306) that the proxy listens on, and the selector that determines which pods will 
answer requests sent through the proxy.
*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
var parseService = function(ns, kind, name, obj, fnum) {
    
    try {
        var tmp;
        var item;
        var sType;
        var lkey = ns + '.' + kind + '.' + name;
        utl.checkType(kind, lkey);
        if (typeof vpk[kind][lkey] === 'undefined') {
            vpk[kind][lkey] = [];
        }
        var ports = [];
        var p_data = {};

        if (typeof obj.metadata !== 'undefined') {
            var sNs = '';
            if (typeof obj.metadata.namespace !== 'undefined') {
                sNs = obj.metadata.namespace;
            }

            var sName = '';
            if (typeof obj.metadata.name !== 'undefined') {
                var sName = obj.metadata.name;
                if (typeof vpk.serviceName[sName] === 'undefined') {
                    // serviceName
                    vpk.serviceName[sName] = [];
                }
                vpk.serviceName[sName].push({
                    'fnum': fnum, 
                    'name': sName,  
                    'namespace': sNs,
                    'fnum': fnum
                });
            }
            // serviceFnum
            if (typeof vpk.serviceFnum[fnum] === 'undefined') {
                vpk.serviceFnum[fnum] = [];
            }
            vpk.serviceFnum[fnum].push({
                'namespace': ns, 
                'name': name, 
                'Ports': [], 
                'Labels': [],
                'fnum': fnum
            })
        }

        // reset obj to only the .spec portion of original yaml
        obj = obj.spec;
        if (typeof obj.type !== 'undefined') {
            sType = obj.type;
        } else {
            sType = '<ukn>'
        }

        if (typeof obj.ports !== 'undefined' && obj !== null) {
            var hl = obj.ports.length;
            for (var p = 0; p < hl; p++) {
                p_data = {};
                if (typeof obj.ports[p] !== 'undefined') {
                    if (typeof obj.ports[p].name !== 'undefined') {
                        p_data.name = obj.ports[p].name;
                    }
                    if (typeof obj.ports[p].port !== 'undefined') {
                        p_data.port = obj.ports[p].port;

                        // links for schematic
                        vpk.serviceFnum[fnum][0].Ports.push({'port': obj.ports[p].port})

                    }
                    if (typeof obj.ports[p].targetPort !== 'undefined') {
                        p_data.target = obj.ports[p].target;
                    }
                    ports.push(p_data);
                }

            }
        } else {
            ports = [];
        }

        
        tmp = vpk[kind][lkey];
        item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'ports': ports,
            'fnum': fnum
        };
        tmp.push(item);
        vpk[kind][lkey] = tmp;
        utl.checkKind(kind);
        
        // add selector labesls if they exist
        if (typeof obj.selector !== 'undefined') {
            if (typeof vpk.serviceFnum[fnum] === 'undefined') {
                vpk.serviceFnum[fnum] = {
                    'fnum': fnum,
                    'namespace': ns,
                    'name': name,
                    'type': sType,
                    'Labels': []
                };
            }

            for(var key in obj.selector){
                var value = obj.selector[key];
                vpk.serviceFnum[fnum][0].Labels.push({'label': key+': '+value})
            }  

        } else {
            // no selector defined, this service will need user defined endpoint or endpointslice to be used
            if (typeof vpk.serviceNoSelector[fnum] === 'undefined') {
                vpk.serviceNoSelector[fnum] = [];
            }
            vpk.serviceNoSelector[fnum].push({'label': '', 'namespace': ns, 'name': name})
            if (typeof vpk.serviceNoSelector[fnum].noSelector === 'undefined') {
                vpk.serviceNoSelector[fnum].noSelector = true;
            }
        }
    } catch (err) {
        utl.logMsg('vpkSVC001 - Error processing file fnum: ' + fnum + ' message: ' + err );
        utl.logMsg('vpkSVC001 - Stack: ' + err.stack);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, fnum) {
        parseService(ns, kind, name, obj, fnum);
    }
};