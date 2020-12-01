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
// build common vars and functions
//----------------------------------------------------------

let svgInfo = {};            // array of information for tool tips
let iCnt = 1;
let oldNS = '@';
let first = true;
let evtCnt = 0;
let partsCnt = 0;
let rdata = '';
let breakData = '';
let breakID = 0;
let height = 0;
let fnum;
let genS;
let cfgS;
let iamS;
let podS;
let netS;
let pvcS;
let genH;
let cfgH;
let iamH;
let podH;
let netH;
let pvcH;
let allH;
let outterName = '';
let cBar = false;
let wCnt = 0;
let cLevel = '';
let countContainer = 0;
let countInitContainer = 0;
let countUnkImage = 0;
let collapseIDs = [];

//vpksecurity based vars
let oldSecNS = '@';
let secFirst = true;
let secBreakID = 100;
let secBldCnt = 0;
let secRData = '';

//vpksecUsage based vars
let whereRoleBound = {};
let whereSubjects = {};
let whereRoleRefs = {};

let RoleBindingCnt = 0;
let ClusterRoleBindingCnt = 0;
let RoleRef_RoleCnt = 0;
let	RoleRef_ClusterRoleCnt = 0;
let bindingStatCounts = [];

let crdRefCnt = 0;

function openAll(type) {
	collapseAction('O', type)
}

function closeAll(type) {
	collapseAction('C', type)
}

function collapseAction(act, type) {
	let id;
	
	for (let c = 0; c < collapseIDs.length; c++) {
		id = '#' + type + collapseIDs[c];
		if (act === 'O') {
			$(id).collapse("show");
		} else {
			$(id).collapse("hide");
		}
	}
}

function parseArray(data) {
	nData = '';
	if (typeof data === 'undefined' || data === '') {
		return nData;
	}

	for (let i = 0; i < data.length; i++) {
		if (data[i] === '') {
			nData = nData + '&lt;blank&gt;<br>'; 
		} else {
			nData = nData + data[i] + '<br>'; 
		}
	}
	return nData;
}

function formatDate(data) {
	if (typeof data === 'undefined' || data === null) {
		return 'Unknown date';
	}
	let mydate = new Date(data);
	let fDate = mydate.toDateString();
	let tPart = data.split('T')
	if (typeof tPart[1] !== 'undefined') {
		fDate = fDate + ' ' + tPart[1]
		if (fDate.endsWith('Z')) {
			fDate = fDate.substring(0, fDate.length - 1) + ' GMT'
		}	
	}
	return fDate;
}

function formatJSON(content) {
	let cData = JSON.stringify(content, null, 2);
	cData = cData.split('\n');
	let nLine = '';
	let rtn = '';
	let pttrn = /^\s*/;
	let spc = 0;
	for (let i = 0; i < cData.length; i++) {
		nLine = '';
		spc = cData[i].match(pttrn)[0].length;
		if (spc > 0) {
			for (let s = 0; s < spc; s++) {
				nLine = nLine + '&nbsp;'
			}
		}
		rtn = rtn + nLine + cData[i].substring(spc) + '<br>';
	}
	return rtn;
} 

function checkImage(kind) {
	let image;
	if (kind === 'Alertmanager') {
		image = 'openshift/ocp-am';
	} else if (kind === 'ConfigMap') {
		image = 'k8/cm';
	} else if (kind === 'CRD') {
		image = 'k8/crd';
	} else if (kind === 'ControllerRevision') {
		image = 'k8/c-rev';
	} else if (kind === 'DaemonSet') {
		image = 'k8/ds';
	} else if (kind === 'CronJob') {
		image = 'k8/cronjob';
	} else if (kind === 'Job') {
		image = 'k8/job';
	} else if (kind === 'Deployment') {
		image = 'k8/deploy';
	} else if (kind === 'DeploymentConfig') {
		image = 'openshift/ocp-dc';
	} else if (kind === 'DNS') {
		image = 'openshift/ocp-dns';
	} else if (kind === 'HorizontalPodAutoscaler') {
		image = 'k8/hpa';
	} else if (kind === 'Network') {
		image = 'openshift/ocp-net';
	} else if (kind === 'OCP-CRD') {
		image = 'openshift/ocp-crd';
	} else if (kind === 'Prometheus') {
		image = 'openshift/ocp-prometheus';
	} else if (kind === 'ReplicaSet') {
		image = 'k8/rs';
	} else if (kind === 'HorizontalPodAutoscaler') {
		image = 'k8/hpa';
	} else if (kind === 'ReplicationController') {
		image = 'k8/rc';
	}  else if (kind === 'Node') {
		image = 'k8/node';
	} else if (kind === 'StatefulSet') {
		image = 'k8/sts';
	} else if (kind === 'Unknown') {
		image = 'unk';
	} else {
		image = 'unk';
	}
	return image;
}

function buildSvgInfo(data, fnum, type) {
	let id = fnum+'.'+type;
	let tName = type;
	if (typeof svgInfo[id] === 'undefined') {
		svgInfo[id] = [];
	}
	let content = buildTipContent(data, type, fnum)
	if (type === 'Phase') {
		tName = 'Pod Phase / IPs'
	}
	if (type === 'CRD') {
		tName = 'CustomResourceDefinition'
	}
	// check if an entry already exists, if so skip
	if (typeof svgInfo[id][0] === 'undefined') {
		svgInfo[id].push('<span style="font-size: 0.80rem; text-decoration: underline;">' + tName + '</span><br><span style="font-size: 0.70rem;">' + content + '</span>');
	}
	return id;
}


function buildTipContent(data, type, fnum) {
	let cnt = 0;
	let content = '';

	if (typeof data === 'undefined') {
		content =  'No info available';
		content = '<div class="vpkfont-xsm">' + content + '</div>'
		return content;
	}

	if (type === 'Unknown') {
		content = 'No resource type located or failed to properly be created.';

	} else if (type === 'ConfigMap') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') Name: ' + data[k].name + ' (Used by: '+ data[k].use +')<br>';
			}
		} else {
			if (typeof data.name !== 'undefined') {
				content = 'Name: ' + data.name;
			}
		}
	} else if (type === 'ClusterRole') {
		if (typeof data !== 'undefined' ) {
			cnt = 0;			
			content = content + 'Name: ' + data.roleRefName;  
		}

	} else if (type === 'ClusterRoleBinding') {
		if (typeof data !== 'undefined' ) {
			cnt = 0;			
			content = content + 'Name: ' + data.crbName;  
		}

	} else if (type === 'Conditions') {
		if (typeof data.conditions !== 'undefined') {
			if (typeof data.conditions[0] !== 'undefined' ) {
				cnt = 0;			
				for (let k = 0; k < data.conditions.length; k++) {
					cnt++;
					content = content + '- &nbsp;&nbsp;<b>Type:</b> ' + data.conditions[k].type + '<br>'
					       + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Status:</b> ' + data.conditions[k].status + '<br>';
					if (typeof data.conditions[k].message !== 'undefined') {
						content = content + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Message:</b> ' + data.conditions[k].message + '<br>'
					}
					if (typeof data.conditions[k].reason !== 'undefined') {
						content = content + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Reason:</b> ' + data.conditions[k].reason + '<br>'
					}					
					content = content + '<br>'
				}
			}	
		}

	} else if (type === 'Container') {
		content = '' 
		if (typeof data.containerNames !== 'undefined' ) {
			for (let k = 0; k < data.containerNames.length; k++) {
				content = content 
				+ '- &nbsp;&nbsp;<b>Name:</b> ' + data.containerNames[k].c_name + '<br>'
				+ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Image:</b> ' + data.containerNames[k].c_image + '<br>';
			}
		}	

	} else if (type === 'ContainerStatus' || type === 'InitContainerStatus') {    // container status
		if (typeof data !== 'undefined' ) {
			cnt = 0;			
			content = '';
			//content = formatJSON(data) + '<br>' 
			content = content 
				+ 'Name: ' + data.name + '<br>' 
				+ 'Restart Count: ' + data.restartCount + '<br>' 
			
		} else {
			content = 'No statuses located'
		}

	} else if (type === 'ControllerRevision') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			content = content + 'Name: ' + data[0].name;  
		}	

	} else if (type === 'CRD') {
		content = 'Name: ' + data;  

		
	} else if ( type === 'DaemonSet' || 
				type === 'Deployment' || 
				type === 'DeploymentConfig' || 
				type === 'ReplicaSet' || 
				type === 'ReplicationController' ||
				type === 'StatefulSet' ) {
		content = 'Name: ' + data.name ; 

	} else if (type === 'EndPoint') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].name ;  
			}
		}

	} else if (type === 'EndPointSlice') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].name ;  
			}
		}

	} else if (type === 'HorizontalPodAutoscaler') {
		content = formatJSON(data);  

	} else if (type === 'PersistentVolumeClaim') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].pvcName;
				if (typeof data[k].pcvStorageClass !== 'undefined') {
					if (data[k].pcvStorageClass !== '') {
						content = content + 'Storage class: ' + data[k].pcvStorageClass + '<br>';  
					}
				}
				if (typeof data[k].pcvVolumeName !== 'undefined') {
					if (data[k].pcvVolumeName !== '') {
						content = content + 'Volume name: ' + data[k].pcvVolumeName + '<br>';  
					}
				}
				if (typeof data[k].pcvSelectorLabel !== 'undefined') {
					if (data[k].pcvSelectorLabel !== '') {
						content = content + 'Selector label: ' + data[k].pcvSelectorLabel + '<br>';  
					}
				}
			}
		}	

	} else if (type === 'PersistentVolume') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].pvName + '<br>';
				if (data[k].pvLocalPath !== '') {
					content = content + 'Local path: ' + data[k].pvLocalPath + '<br>';
				}  
				if (data[k].pvHostPath !== '') {
					content = content + 'Host path: ' + data[k].pvHostPath + '<br>';
				}  
				if (data[k].pvNFSPath !== '') {
					content = content + 'NFS path: ' + data[k].pvNFSPath + '<br>';
				}			}
		}	

	} else if (type === 'Phase') {  //Pod Phase
		content = 'None located';
		if (typeof data.status !== 'undefined') {
			content = '';
			if (typeof data.status.hostIP !== 'undefined') {
				content = content + 'HostIP: ' + data.status.hostIP + '<br>';
			}
			if (typeof data.status.podIP !== 'undefined') {
				content = content + 'PodIP: ' + data.status.podIP + '<br>';
			}
			if (typeof data.status.podIPs !== 'undefined') {
				if (typeof data.status.podIPs.length > 1 !== 'undefined') {
					content = content + 'PodIPs: <br>' + formatJSON(data.status.podIPs) + '<br>';
				}
			}			
		}

	} else if (type === 'Pod') {
		content = '';
		if (typeof data.name !== 'undefined' ) {
			content = content + 'Name: ' + data.name + '<br>';
			if (typeof data.Volume !== 'undefined' ) {
				content = content + 'Volume(s):' + '<br>'
				cnt = 0;			
				for (let k = 0; k < data.Volume.length; k++) {
					cnt++;
					content = content + '(' + cnt + ') ' + data.Volume[k].name + '<br>';  
				}			
			}
		}	
	} else if (type === 'Ref') {
		content = '';
		content = content + data;  
	
	} else if (type === 'Secret') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') Name:' + data[k].name + ' (Used by:'+ data[k].use +')<br>';
			}
		}	

	}  else if (type === 'Service') {
		content = fnum + '<br>' 
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
                content = 'Name: ' + data[k].name+ '<br>';
                if (typeof data[k].type !== 'undefined') {
                    content = content + 'Type: ' + data[k].type;
                }
			}
		}	
	} else 	if (type === 'ServiceAccount') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') Name: ' + data[k].name + '<br>';
			}
		}

	} else if (type === 'StorageClass') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].storageClassName ;  
			}
		}	

	} else {
		content = 'Name: ' + data.name  + '<br>' + 'Type: ' + type;
	}
	content = '<div class="vpkfont-xsm">' + content + '</div>'
	return content;	
}

function buildRBACUsage() {
    whereRoleRefs = {};
	whereRoleBound = {};

	let keys = Object.keys(k8cData);
    let key = '';
    let newKeys = [];
    let newKey;
    let bind;

    // build list of keys and pull out only the 0000- keys
    if (keys.length > 0) {
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
        //clear temp vars
        newKeys = null;
        newKey = null;
    } else {
        // should this return a message that nothing was found
    }

	// build whereBound array 
	for (let k = 0; k < keys.length; k++) {
        key = keys[k];
        //data to show
        if (typeof k8cData[key].RoleBinding !== 'undefined') {
            let bindings = k8cData[key].RoleBinding;
            bindings.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );
            let hl = bindings.length;
            for (r = 0; r < hl; r++) {
                bind = bindings[r];
                populateWhereRoleBound(bind);
                populateWhereRoleRefs(bind);
            }
            updateSecurityBindingCounts(key);
        } else {
            console.log('No RoleBinding located for namespace: ' + key)
        }
    }
}


//For each role binding track where it's bound
function populateWhereRoleRefs(binding) {
    let kind = binding.kind;
    let bindingName = binding.name;
    let bindingNamespace = binding.namespace;
    let roleRefName = binding.roleRef.name;
    let roleRefKind = binding.roleRef.kind;
    let row = '';
    let ns = ''

    if (typeof whereRoleRefs[roleRefName] === 'undefined') {
        whereRoleRefs[roleRefName] = [];
    }

    if (typeof binding.subjects !== 'undefined') {
        for (let b = 0; b < binding.subjects.length; b++) {
            if (typeof binding.subjects[b].namespace === 'undefined') {
                ns = '&lt;clusterLevel&gt;'
            } else {
                ns = binding.subjects[b].namespace;
            }
            row = {
                'kind': kind,
                'bindingName': bindingName,
                'bindingNamespace': bindingNamespace,
                'roleRefKind': roleRefKind,
                'subjectName': binding.subjects[b].name,
                'subjectKind': binding.subjects[b].kind,
                'subjectNamespace': ns,
                'fnum': binding.fnum
            };
            //console.log(JSON.stringify(row))
            whereRoleRefs[roleRefName].push(row);
        }
    }
}


//For each role binding track where it's bound
function populateWhereRoleBound(binding) {
    let roleName = binding.roleRef.name;
    if (roleName === 'default') {
        console.log('k')
    }

	if (typeof whereRoleBound[roleName] === 'undefined') {
		whereRoleBound[roleName] = {
			'ClusterRoleBinding': {'ClusterRole': [],'Role': [] },
			'RoleBinding': {'ClusterRole': [],'Role': [] },
		}
	} 

	if (binding.kind === 'RoleBinding') {
		RoleBindingCnt++
	} else if (binding.kind === 'ClusterRoleBinding') {
		ClusterRoleBindingCnt++
	} else if (binding.roleRef.kind === 'Role') {
		RoleRef_RoleCnt++;
	} else if (binding.roleRef.kind === 'ClusterRole') {
		RoleRef_ClusterRoleCnt++;
	}

	whereRoleBound[roleName][binding.kind][binding.roleRef.kind].push({
		'fnum': binding.fnum,
		'subjects': binding.subjects
    })
}


//----------------------------------------------------------
console.log('loaded vpkcommon.js');