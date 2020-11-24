/*
Copyright 2018 Dave Weilert

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

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseRoleBinding = function(ns, kind, name, obj, src, part, fnum) { 

    try {
        let userNames = '';
        let key = '';
        let clusterLevel = false;
        if (kind.startsWith('Cluster')) {
            clusterLevel = true;
        }

        if (typeof obj.userNames !== 'undefined') {
            userNames = obj.userNames;
        }
        if (userNames === 'null') {
            userNames = '';
        }        
        
        if (clusterLevel === true) {
            if (typeof vpk.clusterRoleBindingFnum[fnum] === 'undefined') {
                vpk.clusterRoleBindingFnum[fnum] = []
            }
            vpk.clusterRoleBindingFnum[fnum].push({
                'name': name, 
                'namespace': ns,
                'fnum': fnum,
                'subjects': obj.subjects,
                'roleRef': obj.roleRef,
                'userNames': userNames,
                'api': obj.apiVersion
            });
        } else {
            if (typeof vpk.roleBindingFnum[fnum] === 'undefined') {
                vpk.roleBindingFnum[fnum] = []
            }
            vpk.roleBindingFnum[fnum].push({
                'name': name, 
                'namespace': ns,
                'fnum': fnum,
                'subjects': obj.subjects,
                'roleRef': obj.roleRef,
                'userNames': userNames,
                'api': obj.apiVersion
            });
        }

        if (typeof obj.subjects !== 'undefined') {
            if (typeof obj.subjects[0] !== 'undefined') {
                if (typeof obj.subjects[0] === 'null') {
                    utl.logMsg('vpkCRB002 - Subject is null, file: ' + src + ' part: ' + part +  ' kind: ' + kind );
                    return;
                }
            } else {
                utl.logMsg('vpkCRB002 - Subject is null or zero length, file: ' + src + ' part: ' + part +  ' kind: ' + kind );
                return;
            }
        } else {
            utl.logMsg('vpkCRB004 - Subject is missing or null, file: ' + src + ' part: ' + part +  ' kind: ' + kind );
            return;
        }

        for (let i = 0; i < obj.subjects.length; i++) {
            key = obj.subjects[i].kind + ':@:' + obj.subjects[i].name;
            if (typeof vpk.subjects[key] === 'undefined') {
                vpk.subjects[key] = [];
            }
            vpk.subjects[key].push({
                'fnum': fnum,
                'namespace': ns,
                'kind': obj.subjects[i].kind,
                'name': obj.subjects[i].name,
                'roleKind': obj.roleRef.kind,
                'roleName': obj.roleRef.name,
                'roleApiGroup': obj.roleRef.apiGroup,
                'userNames': userNames,
                'clusterLevel': clusterLevel
            })
        }
        
    
    } catch (err) {
        utl.logMsg('vpkCRB001 - Error processing file: ' + src + ' part: ' + part +  ' kind: ' + kind + ' message: ' + err);
        utl.logMsg(err.stack)
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {
    parse: function(ns, kind, name, obj, src, part, fnum) {
        parseRoleBinding(ns, kind, name, obj, src, part, fnum);
    }
};