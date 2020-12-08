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

//----------------------------------------------------------
// functions used from modals
//----------------------------------------------------------

// used by chgDirModal
function closeChgDir() {
    $("#chgDirModal").modal('hide')
}


function getNsTable(ns) {
    $("#schemHeader").html('Resources for namespace: <span class="font-weight-bold">' + ns + '</span>');
    if (typeof nsResourceInfo[ns] !== 'undefined') {
        $("#schemBody").html(nsResourceInfo[ns]);
    } else {
        $("#schemBody").html('No namespace resource information located');
    }
    $("#schemModal").modal('show');
}

function getEvtsTable(key) {
    $("#schemHeader").html('<span class="vpkcolor vpkfont">Events for workload</span>');
    if (typeof workloadEventsInfo[key] !== 'undefined') {
        $("#schemBody").html(workloadEventsInfo[key]);
    } else {
        $("#schemBody").html('No events located of workload');
    }
    $("#schemModal").modal('show');
}



function xrefEdit() {
    $("#xrefEditModal").modal('show')    
}

function getSecInfo(key) {
    $("#secInfoContent").html(key)
    $("#secInfoModal").modal('show')
}

function getRoleBindingByNs(ns) {
    buildRBACs();
    let key = formatNsKey(ns);
    let showNs = formatShowNs(ns);
    if (typeof securityRoleBindingInfo[key] === 'undefined') {
        buildRoleBindings(key);
    } 
    $("#schemBody").html(securityRoleBindingInfo[key]);
    $("#schemHeader").html('RoleBindings for <span class="font-weight-bold">' + showNs + '</span>');
    $("#schemModal").modal('show');
}

function getSecRoleByNs(ns) {
    buildRBACs();
    let key = formatNsKey(ns);
    let showNs = formatShowNs(ns);
    if (typeof securityRoleInfo[key] === 'undefined') {
        buildRoles(key);
    } 
    $("#schemBody").html(securityRoleInfo[key]);
    $("#schemHeader").html('Roles for <span class="font-weight-bold">' + showNs + '</span>');
    $("#schemModal").modal('show');
}

function getSecSubjectsByNs(ns) {
    buildRBACs();
    let key = formatNsKey(ns);
    let showNs = formatShowNs(ns);
    if (typeof securitySubjectInfo[key] === 'undefined') {
        buildRoleBindings(key);
    } 
    $("#schemBody").html(securitySubjectInfo[key]);
    $("#schemHeader").html('Subjects for <span class="font-weight-bold">' + showNs + '</span>');
    $("#schemModal").modal('show');
}

function formatNsKey(ns) {
    let key = '';
    if (ns.startsWith('0000-')) {
        key = ns;
    } else {
        key = '0000-' + ns;
    }
    return key;
}

function formatShowNs(ns) {
    let showNs = '';
    if (ns.startsWith('0000-')) {
        showNs = ns.substring(5);
        if (showNs === '@clusterRoleBinding@' || showNs === '@clusterRoles@' || showNs === '@subjects@') {
            showNs = '&lt;Cluster Level&gt;';
        }
    } else {
        showNs = ' namespace: ' +ns;
    } 
    return showNs;
}

//----------------------------------------------------------
console.log('loaded vpkmodalHandlers.js');