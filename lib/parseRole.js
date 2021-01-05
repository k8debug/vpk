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
Parse Role and ClusterRole
*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
var parseRole = function(ns, kind, name, obj, fnum) { 

    try {
        //if (ns === 'cluster-level' || ns === '') {
        if (kind === 'ClusterRole') {
            if (typeof vpk.clusterRoleFnum[fnum] === 'undefined') {
                vpk.clusterRoleFnum[fnum] = []
            }
            vpk.clusterRoleFnum[fnum].push({
                'name': name, 
                'namespace': ns,
                'fnum': fnum,
                'roleKind': kind,
                'rules': obj.rules,
                'api': obj.apiVersion,
            });
        } else {
            if (typeof vpk.roleFnum[fnum] === 'undefined') {
                vpk.roleFnum[fnum] = []
            }
            vpk.roleFnum[fnum].push({
                'name': name, 
                'namespace': ns,
                'fnum': fnum,
                'roleKind': kind,
                'rules': obj.rules,
                'api': obj.apiVersion,
            });
        }
    
    } catch (err) {
        utl.logMsg('vpkROL001 - Error processing file fnum: ' + fnum +  ' kind: ' + kind + ' message: ' + err);
        utl.logMsg('vpkROL001 - Stack: ' + err.stack);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {
    parse: function(ns, kind, name, obj, fnum) {
        parseRole(ns, kind, name, obj, fnum);
    }
};