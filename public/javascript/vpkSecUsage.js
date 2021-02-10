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
// build svg data from returned data
//----------------------------------------------------------


function initVars() {
    coleBindingCnt = 0;
    clusterRoleBindingCnt = 0;
    roleRefRoleCnt = 0;
    roleRefClusterRoleCnt = 0; 
    unknownKindCnt = 0;   
    bindingStatCounts = [];
}

function updateSecurityBindingCounts(ns) {
    bindingStatCounts.push({
        'namespace': ns.substring(5),
        'roleBindingCnt': roleBindingCnt,
        'clusterRoleBindingCnt': clusterRoleBindingCnt,
        'roleRefRoleCnt': roleRefRoleCnt,
        'roleRefClusterRoleCnt': roleRefClusterRoleCnt
    });		
    roleBindingCnt = 0;
    clusterRoleBindingCnt = 0;
    roleRefRoleCnt = 0;
    roleRefClusterRoleCnt = 0; 
    unknownKindCnt = 0; 

}


function securityUsage() {
    // load security arrays if not loaded
    buildRBACs();

	let cLevel = '';
	//Clear and initialize the variables
	initVars();
	//Clear the browse DOM elements
    $("#securityDetail").hide();
    $("#securityDetail").empty();
    $("#securityDetail").html('');

    //Build the RBAC lists and stats
    buildRBACUsage();

    //Build the stats table
    //let html = buildSecStatsTable();

    let html = buildRoleRefTable();

	//Update the browser DOM
	$("#securityDetail").html(html);
	$("#securityDetail").show();
}

function buildRoleRefTable () {
    let keys = Object.keys(whereRoleRefs);
    let key = '';
    let rtn = '';
    let item = '';
    let line = '';
	let divSection = '<div class="events" ><table style="width:100%">';
    let header = '<tr class="partsList">' 
    + '<th class="align-middle text-center">Role<br>Name</th>' 
    + '<th class="text-left pl-3">Binding Level</th>' 
    + '<th class="text-left pl-3">Binding Name</th>' 
    + '<th class="text-left pl-3">Subject Kind</th>' 
    + '<th class="text-left pl-3">Subject Name</th>' 
    + '</tr>';    
    rtn = rtn + divSection + RBAClegend + header

    for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        item = whereRoleRefs[key];
        line = '<tr class="mt-0 mb-0">' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '</tr>'

        + '<tr><td style="width="30%" colspan="3"><span class="bg-clusterRole" ' 
        + ' onclick="getSecRole(\'' + key + '\')">' + key + '</span></td>' 
        + '<td></td>  <td></td>' 
        + '<td></td>   </tr> '
        + '<tr class="mt-0 mb-0">' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
        + '</tr>';
        rtn = rtn + line;
        for (let d = 0; d < item.length; d++) {
            let sFnum = '';
            let subject = '';
            let bNs = ''
            if (item[d].subjectKind === 'ServiceAccount') {
                sFnum = lookupSubjectName(item[d].subjectName, item[d].subjectNamespace, item[d].subjectKind);
                subject = '<span class="bg-info text-light" onclick="getDefFnum(\'' + sFnum + '\')">' + item[d].subjectName + '</span>';
            } else {
                subject = item[d].subjectName;
            }
            if (item[d].bindingNamespace === 'clusterLevel') {
                bNs = '&lt;clusterLevel&gt;'
            } else {
                bNs = item[d].bindingNamespace;
            }

            line = '<tr class=""><td>&nbsp;</td>' 
            + '<td class="pr-4  align-text-top">' + item[d].kind + '</td>'
            + '<td class="pr-4"><span class="bg-rbn text-light" onclick="getDefFnum(\'' + item[d].fnum + '\')">' 
            + item[d].bindingName + '</span><br>Namespace: ' + bNs + '</td>'
            + '<td class="pr-1 text-right align-text-top ' + subjectTextColor(item[d].subjectKind) + '"><b>' + item[d].subjectKind + '</b></td>'
            + '<td class="pr-4">' + subject + '<br>Namespace: ' + item[d].subjectNamespace + '</td>'
            + '</tr>'
            rtn = rtn + line;
            line = '<tr class="mt-0 mb-0">' 
            + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
            + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
            + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
            + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
            + '<td class="mt-0 mb-0"><hr class="mt-0 mb-0"></td>' 
            + '</tr>';
            rtn = rtn + line;
        }
    }
    rtn = rtn + '</table></div>'
    return rtn;
}

function lookupSubjectName(name, ns, kind) {
    let nsKey = '0000-' + ns;
    let saList = [];

    if (typeof k8cData[nsKey] !== 'undefined') {
        if (typeof k8cData[nsKey].ServiceAccount !== 'undefined') {
            saList = k8cData[nsKey].ServiceAccount
        } else {
            return 'missing';
        }

        for (let s = 0; s < saList.length; s++) {
            if (saList[s].name === name ) {
                if (typeof saList[s].fnum !== 'undefined') {
                    return saList[s].fnum;
                }
            }
        }
        return 'missing';
    }
}

function subjectTextColor(kind) {
    let color = 'vpkcolor';
    if (kind === 'ServiceAccount') {
        color = 'text-info';
    } else if (kind === 'Group') {
        color = 'text-warning';
    } else if (kind === 'User') {
        color = 'text-danger';
    } else if (kind === 'SystemGroup') {
        color = 'text-primary';
    } else if (kind === 'SystemUser') {
        color = 'text-secondary';
    }
    return color; 
}

// STATS in not currently in use or shown in UI
function showSecurityStats() {
    if (typeof k8cData === 'undefined') {
        showMessage('No data loaded','fail');
        return;
    }
    buildRBACs();
    buildRBACUsage();
    $("#schemHeader").html('RBAC Security statistics');
    if (typeof bindingStatCounts[0] !== 'undefined') {
        $("#schemBody").html(buildSecStatsTable() );
    } else {
        $("#schemBody").html('No security statistics available');
    }
    $("#schemModal").modal('show');
}

function buildSecStatsTable () {
    let rtn = '';
    let item = '';
    let line = '';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
    let header = '<tr class="partsList"><th>Namespace</th><th>ClusterRoleBinding</th><th>RoleBinding</th>' 
    + '<th>ClusterRole</th><th>Role</th></tr>';    
    
    rtn = rtn + divSection + header

    for (let i = 0; i < bindingStatCounts.length; i++) {
        item = bindingStatCounts[i];
        line = '<tr class="vpkcolor"><td>' + item.namespace 
        + '</td><td>' + item.clusterRoleBindingCnt
        + '</td><td>' + item.roleBindingCnt
        + '</td><td>' + item.roleRefClusterRoleCnt
        + '</td><td>' + item.roleRefRoleCnt
        + '</td></tr>'
        rtn = rtn + line;
    }
    rtn = rtn + '</table></div>'
    return rtn;
}



//----------------------------------------------------------
console.log('loaded vpkSecUsage.js');