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
// build security related arrays
//----------------------------------------------------------

function buildSecArrays() {
	//Build the arrays
	buildRBACs();	
}

//
function buildRBACs() {
	// check if data already loaded, if so skip realoading
	if (securityArraysLoaded === true) {
		return;
	}

	let keys = Object.keys(k8cData);
	let newKeys = [];
	let newKey;
	let secKey;
	let level;

	for (let p = 0; p < keys.length; p++) {
		newKey = keys[p];
		if (newKey.startsWith('0000-') ) {
			newKeys.push({'namespace': k8cData[newKey].namespace, 'fnum': newKey} );
		} 
	}	

    // sort by namespace & fnum
    newKeys.sort((a, b) => (a.namespace > b.namespace) ? 1 : (a.namespace === b.namespace) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	// clear the old unsorted keys
	keys = [];  

	// build new sorted array: keys
	for (let t = 0; t < newKeys.length; t++) {
		newKey = newKeys[t].fnum;
		keys.push(newKey);
	}

	// process data 
	for (let k = 0; k < keys.length; k++) {
		secKey = keys[k];
		// skip non-namespace entries
		if (secKey === '0000-clusterLevel') {
			continue;
		}
	
		level = 'ns';
		if (secKey === '0000-@clusterRoles@') {
			level = 'cl';
		}


		buildRoles(secKey, level);
		buildRoleBindings(secKey);
		buildSubjects(secKey);

		securityArraysLoaded = true;
	}
}

//Build the RoleBinding subjects information
function parseRBSubject(data, printAllLines, fnum) {
	if (typeof data === 'undefined') {
		return;
	}
	let	nData = '';
	let hl = data.length;
	let line1Color;
	let line2; 
	let line3; 
	let linkValue;

	for (let i = 0; i < hl; i++) {
		line1Color = '';
		line2 = ''; 
		line3 = ''; 
		linkValue = '@';
		if (typeof data[i].name !== 'undefined' ) {
			linkValue = linkValue + data[i].name + '@';
			if (typeof data[i].kind !== 'undefined' ) {
				if (data[i].kind === 'ServiceAccount' ) {
					line1Color = 'bg-subjectServiceAccount';
				} else if (data[i].kind === 'Group' ) {
					line1Color = 'bg-subjectGroup';
				} else if (data[i].kind === 'User' ) {
					line1Color = 'bg-subjectUser';
				} else if (data[i].kind === 'SystemGroup' ) {
					line1Color = 'bg-subjectSystemGroup';
				} else if (data[i].kind === 'SystemUser' ) {
					line1Color = 'bg-subjectSystemUser';
				} else {
					line1Color = 'bg-unknown';
					console.log('Unmanaged kind for Subject: ' + data[i].kind)
				}
			} else {
				line1Color = 'bg-unknown';
			}
		}
		if (printAllLines === true) {
			if (typeof data[i].kind !== 'undefined' ) {
				linkValue = linkValue + data[i].kind + '@';
				line2 = 'Kind: ' + data[i].kind + '<br>';
			} else {
				linkValue = linkValue + '<blank>:';
			}
		
			if (typeof data[i].namespace !== 'undefined' ) {
				linkValue = linkValue + data[i].namespace + '@';
				line3 = 'Namespace: ' + data[i].namespace + '<br>';
			} else {
				linkValue = linkValue + '<blank>:';
			}
		}

		// build html output
		nData = nData + 'Name: <span class="' + line1Color + '" onclick="getDefFnum(\'' + fnum + '\')">' + data[i].name + '</span><br>';
		if (line2 !== '') {
			nData = nData + line2;
		}
		if (line3 !== '') {
			nData = nData + line3;
		}		

	}
	return nData;
}

// Build subjects data for each namespace from 0000-@subjects@ creating
// html div section with subject data and saved in the array
function buildSubjects(ns) {
	// skip cluster level role bindings and roles, do not add these to subjects array
	if (ns === '0000-@clusterRoles@' || ns === '0000-@clusterRoleBinding@' ) {
		return;
	}
	let nsKey = '0000-@subjects@';		// set key to get subjects data from k8cData 
	if (typeof k8cData[nsKey] === 'undefined') {
		return '';   					// no subject data found
	}	
	
	ns = ns.substring(5); 				// get namespace by striping the 0000-
	let subsData = k8cData[nsKey];
	let keys = Object.keys(subsData);
	keys.sort();

	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Subject Kind</th><th>Subject Name</th><th>RoleRef Kind</th><th>RoleRef</th></tr>';
	let subs;
	let sKeys;
	let item;
	let elem;
	let subject;
	let data;
	let roleK;
	let roleRefName;
	let nsHtml = divSection + RBAClegend + header;;

	for (let k = 0; k < keys.length; k++) {
		subs = subsData[keys[k]]
		sKeys = Object.keys(subs);
		sKeys.sort();
		sKeys.sort((a, b) => (a.name > b.name) ? 1 : (a.name === b.name) ? ((a.roleKind > b.roleKind) ? 1 : -1) : -1 );

		for (r = 0; r < sKeys.length; r++) {
			elem = subs[sKeys[r]];

			if (elem.roleKind === 'Role') {			// why am i skipping all 'Role'
				continue;
			}
			if (ns === '@subjects@') {
				if (elem.namespace === '') {
					elem.namespace = '<cluster>'
				}
			} else {
				if (elem.namespace !== ns) {
					continue;
				}
			}

			fnum = elem.fnum;
			data = [];
			data.push({'name': elem.name, 'kind': elem.kind});
			subject = parseRBSubject(data, false, elem.fnum)
			if (subject === '') {
				subject = '<span class="noSubject">&lt;No subjects defined&gt;</span>'
			}

			if (typeof elem.roleKind === 'undefined') {
				roleK = 'Unknown';
			} else {
				roleK = elem.roleKind;
			}
			if (typeof elem.roleName === 'undefined') {
				roleRefName = 'Unknown';
			} else {
				roleRefName = elem.roleName;
			}
			if (roleK === 'ClusterRole') {
				roleColor = 'bg-clusterRole';
			} else {
				roleColor = 'bg-role'
			}

			item = '<tr>' 
			+ '<td width="10%">' + elem.kind  + '</td>' 
			+ '<td width="40%">' + subject + '<span class="pt-0 pb-0">Namespace: ' + elem.namespace+ '</span></td>' 
			+ '<td width="10%">' + roleK + '</td>' 
			+ '<td width="40%"><span class="' + roleColor + '" onclick="getSecRole(\'' + roleRefName + '\')">' + roleRefName + '</span></td>' 
			+ '</tr>';
			nsHtml = nsHtml + item
			item = '<tr>' 
			+ '<td width="10%">' + hrLow + '</td>' 
			+ '<td width="40%">' + hrLow + '</td>' 
			+ '<td width="10%">' + hrLow + '</td>' 
			+ '<td width="40%">' + hrLow + '</td>' 
			+ '</tr>';
			nsHtml = nsHtml + item		
		}
	}
 
	nsHtml = nsHtml + '</table></div>';

	// add content to the array
	let bldKey = '0000-'+ns;
	if (typeof securitySubjectInfo[bldKey] === 'undefined') {
		securitySubjectInfo[bldKey] = nsHtml;
	} else {
		securitySubjectInfo[bldKey] = nsHtml;
	}
	return;
}

//Build RoleBinding information
function buildRoleBindings(ns) {
	// skip cluster level subject and roles, do not add these to role bindings array
	if (ns === '0000-@subjects@' || ns === '0000-@clusterRoles@') {
		return;
	}
	// check if there are any RoleBinding entries to process
	if (typeof k8cData[ns].RoleBinding === 'undefined') {
		return;
	}
	let used = {};
	let nsKey = ns;
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Binding</th><th>Role</th><th>Subject</th></tr>';
	let bind;
	let hl;
	let item;
	let name;
	let fnum;
	let subject;
	let roleName;
	let roleType;
	let roleGet;
	let uKey;
	let bKind;
	let rColor;
	let bColor;
	let nsHtml = divSection + RBAClegend + header;
	let bindings = k8cData[nsKey].RoleBinding;
	bindings.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );
	hl = bindings.length;

	for (r = 0; r < hl; r++) {
		bind = bindings[r];
		name = bind.name;
		subject = '';
		roleName = '';
		if (typeof bind.roleRef !== 'undefined') {
			if (typeof bind.roleRef.name !== 'undefined') {
				roleName = bind.roleRef.name;
			}
		}

		if (typeof bind.subjects !== 'undefined') {
			if (typeof bind.subjects[0] !== 'undefined') {
				if (typeof bind.subjects[0].kind !== 'undefined') {
					bKind = bind.subjects[0].kind
				} else {
					//console.log('RoleBinding ns: ' + ns)
					//console.log('No bind.subjects[0].kind, skipping: ' + JSON.stringify(bind, null, 2))
					bKind = '<blank>';
				}		
			} else {
				//console.log('RoleBinding ns: ' + ns)
				//console.log('No bind.subjects[0], skipping: ' + JSON.stringify(bind, null, 2))
				bKind = '<blank>';
			}
		} else {
			//console.log('RoleBinding ns: ' + ns)
			//console.log('No bind.subjects, skipping: ' + JSON.stringify(bind, null, 2))
			bKind = '<blank>';
		}

		uKey = name+'@'+roleName+'@'+bKind;
		if (typeof used[uKey] === 'undefined') {
			used[uKey] = 1
		} else {
			continue;
		}

		fnum = bind.fnum;
		subject = parseRBSubject(bind.subjects, true, bind.fnum);
		if (subject === '') {
			subject = '<span class="noSubject">&lt;No subjects defined&gt;</span>'
		}

		if (bind.kind === 'ClusterRoleBinding') {
			bColor = 'bg-clusterRoleBinding';
		} else if (bind.kind === 'RoleBinding') {
			bColor = 'bg-roleBinding';
		} else {
			bColor = 'bg-roleBindingUnk';
		}

		//TODO is this all that is needed for
		let crHl = k8cData['0000-@clusterRoles@'].Role.length
		rColor = 'bg-role';
		roleType = 'n';
		roleGet = 'getSecRole';
		for (let f = 0; f < crHl; f++ ) {
			if (k8cData['0000-@clusterRoles@'].Role[f].name === roleName) {
				rColor = 'bg-clusterRole';
				roleType = 'c'
				roleGet = 'getSecRole';
				break;
			} 
		}

		item = '<tr>' 
		+ '<td width="34%" class="align-top"><span class="' + bColor + '" onclick="getDefFnum(\'' + fnum + '\')">' + name + '</td>' 
		+ '<td width="33%" class="align-top"><span class="' + rColor 
		+ '" onclick="' + roleGet + '(\'' + roleName + '\',\'' + rColor + '\',\'' + ns + '\')">' 
		+ roleName + '<span></td>' 
		+ '<td width="33%" class="align-top" >' + subject + '</td>' 
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="34%">' + hrLow + '</td>' 
		+ '<td width="33%">' + hrLow + '</td>' 
		+ '<td width="33%">' + hrLow + '</td>' 
		+ '</tr>';
		nsHtml = nsHtml + item		
	}
	
	nsHtml = nsHtml + '</table></div>';

	// add content to the array
	if (typeof securityRoleBindingInfo[ns] === 'undefined') {
		securityRoleBindingInfo[ns] = nsHtml;
	} else {
		securityRoleBindingInfo[ns] = nsHtml;
	}

	used = null;
	return;
}

//Build the Role information
function buildRoles(ns, level) {
	// skip cluster level subject and roles, do not add these to role bindings array
	if (ns === '0000-@subjects@' || ns === '0000-@clusterRoleBinding@') {
		return;
	}
	let nsKey = ns;

	// check if there are any role entries to process
	if (typeof k8cData[nsKey].Role === 'undefined') {
		return
	}

	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Role Name</th><th>Category</th><th>Category Values</th><th>Resource Names</th><th>Resources</th><th>Verbs</th></tr>';
	let role;
	let hl;
	let item;
	let name;
	let fnum;
	let resourceNames;
	let resources;
	let verbs;
	let nsHtml = divSection + RBAClegend + header;
	let roles = k8cData[nsKey].Role;
	let rColor;

	if (level === 'ns') {
		rColor = 'bg-role';
	} else {
		rColor = 'bg-clusterRole';
	}
	roles.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );
	hl = roles.length;

	for (r = 0; r < hl; r++) {
		grpInfo = '';
		category = '';
		resourceNames = '';
		resources = '';
		verbs = '';
		role = roles[r];
		name = role.name;
		fnum = role.fnum;
		item = '<tr class="roleRBAC">' 
		+ '<td width="50%" colspan="3" class="top"><span class="' + rColor + '" onclick="getDefFnum(\'' + fnum + '\')">' + name + '</span></td>' 
        + '<td></td>  <td></td>' 
        + '<td></td>  </tr>';

		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="15%">' + hrLow + '</td>' 
		+ '<td width="15%">' + hrLow + '</td>' 
		+ '<td width="20%">' + hrLow + '</td>' 
		+ '<td width="20%">' + hrLow + '</td>' 
		+ '<td width="20%">' + hrLow + '</td>' 
		+ '<td width="10%">' + hrLow + '</td>' 
		+ '</tr>';
		nsHtml = nsHtml + item		

		if (typeof role.rules !== 'undefined' && role.rules !== 'null' && role.rules !== null) {

			for (let c = 0; c < role.rules.length; c++) {
				grpInfo = '&lt;null&gt;';
				if (typeof role.rules[c].apiGroups !== 'undefined') {
					category = 'apiGroup'
					if (role.rules[c].apiGroups !== null) {
						grpInfo = parseArray(role.rules[c].apiGroups);
						category = 'apiGroup'
					}
				}
				if (typeof role.rules[c].nonResourceURLs !== 'undefined') {
					category = 'nonResourceURLs'
					if (role.rules[c].nonResourceURLs !== null) {
						grpInfo = parseArray(role.rules[c].nonResourceURLs);
						category = 'nonResourceURLs'
					}
				}
				if (typeof role.rules[c].resourceNames !== 'undefined') {
					resourceNames = parseArray(role.rules[c].resourceNames);
				}
				if (typeof role.rules[c].resources !== 'undefined') {
					resources = parseArray(role.rules[c].resources);
				}
				if (typeof role.rules[c].verbs !== 'undefined') {
					verbs = parseArray(role.rules[c].verbs);
				}

				item = '<tr>' 
				+ '<td width="15%">&nbsp;</td>' 
				+ '<td width="15%" class="align-top ">' + category + '</td>' 
				+ '<td width="20%" class="align-top ">' + grpInfo + '</td>' 
				+ '<td width="20%" class="align-top ">' + resourceNames + '</td>' 
				+ '<td width="20%" class="align-top ">' + resources + '</td>' 
				+ '<td width="10%" class="align-top">' + verbs + '</td>' 
				+ '</tr>';
				nsHtml = nsHtml + item

				item = '<tr>' 
				+ '<td width="15%">' + hrLow + '/td>' 
				+ '<td width="15%">' + hrLow + '</td>' 
				+ '<td width="20%">' + hrLow + '</td>' 
				+ '<td width="20%">' + hrLow + '</td>' 
				+ '<td width="20%">' + hrLow + '</td>' 
				+ '<td width="10%">' + hrLow + '</td>'
				+ '</tr>';
				nsHtml = nsHtml + item
			} 
		} else {
			console.log('No Role rules located for ns: ' + ns + ' content:' + JSON.stringify(role))
			item = '<tr>' 
			+ '<td width="15%">&nbsp;</td>' 
			+ '<td width="15%" class="align-top">&lt;No rules defined&gt;</td>' 
			+ '<td width="20%" class="align-top">&lt;blank&gt;</td>' 
			+ '<td width="20%" class="align-top">&lt;blank&gt;</td>' 
			+ '<td width="20%" class="align-top">&lt;blank&gt;</td>' 
			+ '<td width="10%" class="align-top">&lt;blank&gt;</td>' 
			+ '</tr>';
			nsHtml = nsHtml + item

			item = '<tr>' 
			+ '<td width="20%">' + hrLow + '</td>' 
			+ '<td width="10%">' + hrLow + '</td>'
			+ '<td width="20%">' + hrLow + '</td>' 
			+ '<td width="20%">' + hrLow + '</td>' 
			+ '<td width="20%">' + hrLow + '</td>' 
			+ '<td width="10%">' + hrLow + '</td>' 
			+ '</tr>';
			nsHtml = nsHtml + item
		}
	}

	nsHtml = nsHtml + '</table></div>';

	// add content to the array
	if (typeof securityRoleInfo[ns] === 'undefined') {
		securityRoleInfo[ns] = nsHtml;
	} else {
		securityRoleInfo[ns] = nsHtml;
	}

	return;
}


//----------------------------------------------------------
console.log('loaded vpkBuildSecArrays.js');