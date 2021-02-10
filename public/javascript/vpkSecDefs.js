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
// build security definitions display 
//----------------------------------------------------------

function securityDefinitions() {

	//Build the html
	let html = buildSecDefHtml();	
    
    //Update the browse DOM elements
    $("#securityDetail").hide();
    $("#securityDetail").empty();
	$("#securityDetail").html(html);
	$("#securityDetail").show();
	
}

//
function buildSecDefHtml() {
	let rdata = '';
	let newKeys = [];
	let newKey;
	let secKey;
	let breakKey;
    let secBreakId = 100;
    let header = '<div class="vpkfont-md vpkcolor ml-2 mt-2 mb-2">Press buttons to view security definitions for cluster or namespace</div>';
    let nsHtml = '';
	let keys = Object.keys(k8cData);
	for (let p = 0; p < keys.length; p++) {
		newKey = keys[p];
		if (newKey.startsWith('0000-') ) {
			newKeys.push({'namespace': k8cData[newKey].namespace, 'fnum': newKey} );
		} 
	}	

    // sort by namespace & kind
    newKeys.sort((a, b) => (a.namespace > b.namespace) ? 1 : (a.namespace === b.namespace) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	// clear the old unsorted keys
	keys = [];  

	// build new sorted array: keys
	for (let t = 0; t < newKeys.length; t++) {
		newKey = newKeys[t].fnum;
		keys.push(newKey);
    }

	// process namespaces  
	for (let k = 0; k < keys.length; k++) {
        secKey = keys[k];
        // Skip non-namespace and cluster level items.  
        // Cluster level is check before building final html
        if (secKey === '0000-clusterLevel' || secKey === '0000-@subjects@' || 
            secKey === '0000-@clusterRoles@' || secKey === '0000-@clusterRoleBinding@') {
			continue;
        }

        secBreakId++;
        breakKey = secKey.substring(5);   // strip the '0000-'
        rdata = '<div class="breakBar"><button type="button" ' 
        + ' class="btn btn-sm bg-secondary text-light vpkButtons pr-5 pl-5" data-toggle="collapse" data-target="#securityID-' 
        + secBreakId + '">' + breakKey + '</button>'
        + '<hr></div>'
        + '<div id="securityID-' + secBreakId + '" class="collapse">'
        + '<div class="row mb-3 mt-3 ml-4">';

        if (typeof securityRoleInfo[secKey] !== 'undefined') {
            rdata = rdata + '<div class="col-2">'
	        + '<img style="float:left" src="images/k8/role.svg" width="40" height="40" onclick="getSecRoleByNs(\'' + secKey +'\')" />'
	        + '<div class="vpkfont-md vpkcolor ml-2 mt-2">'
	        + '  <span class="pl-2" onclick="getSecRoleByNs(\'' + secKey +'\')">Roles</span>'
	        + '</div></div>';
        }
        if (typeof securityRoleBindingInfo[secKey] !== 'undefined') {
            rdata = rdata + '<div class="col-2">'
	        + '<img style="float:left" src="images/k8/rb.svg" width="40" height="40" onclick="getRoleBindingByNs(\'' + secKey +'\')" />'
	        + '<div class="vpkfont-md vpkcolor ml-2 mt-2">'
	        + '  <span class="pl-2" onclick="getRoleBindingByNs(\'' + secKey +'\')">RoleBinding</span>'
	        + '</div></div>';
        }
        if (typeof securitySubjectInfo[secKey] !== 'undefined') {
            rdata = rdata + '<div class="col-2">'
	        + '<img style="float:left" src="images/k8/subjects.svg" width="40" height="40" onclick="getSecSubjectsByNs(\'' + secKey +'\')" />'
	        + '<div class="vpkfont-md vpkcolor ml-2 mt-2">'
	        + '  <span class="pl-2" onclick="getSecSubjectsByNs(\'' + secKey +'\')">Subjects</span>'
	        + '</div></div>';
        }

        rdata = rdata + '<div class="col-6"></div></div></div>';

        nsHtml = nsHtml + rdata;

		
    }

    let cLevel = checkClusterLevel();
    if (cLevel !== '') {
        nsHtml = header + cLevel + nsHtml
    } else {
        nsHtml = header + nsHtml
    }
	return nsHtml;
}

function checkClusterLevel() {
    let rdata = '';

    rdata = '<div class="breakBar"><button type="button" ' 
    + ' class="btn btn-sm bg-secondary text-light vpkButtons" data-toggle="collapse" data-target="#securityCLevel">' 
    + '&nbsp;&nbsp;&lt;Cluster Level&gt;&nbsp;&nbsp;</button>'
    + '&nbsp;&nbsp;<hr></div>'
    + '<div id="securityCLevel" class="collapse">'
    + '<div class="row mb-3 mt-3 ml-4">';

    if (typeof securityRoleInfo['0000-@clusterRoles@'] !== 'undefined') {
        rdata = rdata + '<div class="col-2">'
        + '<img class="float-left" src="images/k8/c-role.svg" width="40" height="40" onclick="getSecRoleByNs(\'0000-@clusterRoles@\')" />'
        + '<div class="vpkfont-md vpkcolor ml-2 mt-2">'
        + '  <span onclick="getSecRoleByNs(\'0000-@clusterRoles@\')">&nbsp;&nbsp;Cluster Roles</span>'
        + '</div></div>';
    }
    if (typeof securityRoleBindingInfo['0000-@clusterRoleBinding@'] !== 'undefined') {
        rdata = rdata + '<div class="col-2">'
        + '<img class="float-left" src="images/k8/crb.svg" width="40" height="40" onclick="getRoleBindingByNs(\'0000-@clusterRoleBinding@\')" />'
        + '<div class="vpkfont-md vpkcolor ml-2 mt-2">'
        + '  <span onclick="getRoleBindingByNs(\'0000-@clusterRoleBinding@\')">&nbsp;&nbsp;Cluster RoleBinding</span>'
        + '</div></div>';
    }
    if (typeof securitySubjectInfo['0000-@subjects@'] !== 'undefined') {
        rdata = rdata + '<div class="col-2">'
        + '<img class="float-left" src="images/k8/subjects.svg" width="40" height="40" onclick="getSecSubjectsByNs(\'0000-@subjects@\')" />'
        + '<div class="vpkfont-md vpkcolor ml-2 mt-2">'
        + '  <span onclick="getSecSubjectsByNs(\'0000-@subjects@\')">&nbsp;&nbsp;Subjects</span>'
        + '</div></div>';
    }

    rdata = rdata + '<div class="col-6"></div></div></div>';
    return rdata;

}

//----------------------------------------------------------
console.log('loaded vpkSecDefs.js');