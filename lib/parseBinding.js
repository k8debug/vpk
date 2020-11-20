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

/*------------------------------------------------------------------------------

Generic template to parse kubernetes resource type/kind

*/

var vpk = require('./vpk');
var utl = require('./utl');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseBinding = function(ns, y_kind, name, obj, src, part, fnum) { 
    try {
        let roleName;
        let roleKind;
        let roleNS;

        if (typeof obj.roleRef !== 'undefined') {
            if (typeof obj.roleRef.name !== 'undefined') { 
                roleName = obj.roleRef.name
                if (typeof vpk.bindings[roleName] === 'undefined') {
                    vpk.bindings[roleName] = [];
                }
                vpk.bindings[roleName].push({'type': y_kind, 'fnum': fnum});
            }
        }

        if (typeof obj.subjects !== 'undefined') {
            for (let i = 0; i < obj.subjects.length; i++) {
                if (typeof obj.subjects[i].name !== 'undefined') { 
                    roleName = obj.subjects[i].name
                    
                    if (typeof obj.subjects[i].kind !== 'undefined') {
                        roleKind = obj.subjects[i].kind;
                    } else {
                        roleKind = 'unkn';
                    }

                    if (typeof obj.subjects[i].namespace !== 'undefined') {
                        roleNS = obj.subjects[i].namespace;
                    } else {
                        roleNS = 'cluster-level';
                    }

                    if (typeof vpk.bindings[roleKind] === 'undefined') {
                        vpk.bindings[roleKind] = {};
                    }

                    if (typeof vpk.bindings[roleKind][roleNS] === 'undefined') {
                        vpk.bindings[roleKind][roleNS] = {};
                    }

                    if (typeof vpk.bindings[roleKind][roleNS][roleName] === 'undefined') {
                        vpk.bindings[roleKind][roleNS][roleName] = [];
                    }

                    vpk.bindings[roleKind][roleNS][roleName].push({'fnum': fnum});
                }
            }
        }

    } catch (err) {
        utl.logMsg('vpkBND001 - Error processing file: ' + src + ' part: ' + part +  ' kind: ' + y_kind + ' message: ' + err);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {
    parse: function(ns, kind, name, obj, src, part, fnum) {
        parseBinding(ns, kind, name, obj, src, part, fnum);
    }
};