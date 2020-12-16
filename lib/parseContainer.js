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

Containers are only ever created within the context of a Pod. This is usually done using a 
Controller. See Controllers: Deployment, Job, or StatefulSet

*/

var vpk = require('./vpk');
var utl = require('./utl');
var hierarchy = require('./hierarchy');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseContainer = function(ns, kind, name, obj, rCnt, src, part, ctype, fnum) {
	var doit = true;
	var e = -1;
	var c_name = '';
	var c_image = '';
	// var c_command = '';
	// var c_args = '';
	// var c_key = '';
	// var c_readinessProbe = '';
	// var c_livenessProbe = '';
	// var c_env = '';
	var cmapRef;
	var secRef;
	var fldRef;
	var volMount;
	var pStep = 'init';
	var hval;
	var tmpi;
	if (ctype === 'C') {
		hval = "Container"; 
		utl.countKind('Container');
	} else if (ctype === 'I') {
		hval = "InitContainer"
		utl.countKind('IContainer');
	}

	//var fld = getFileId(src);
	try {
		while (doit) {
			pStep = 'Outter_Loop'
			// c_key = '';
			c_name = '';
			c_image = '';
			// c_command = '';
			// c_args = '';
			// c_readinessProbe = '';
			// c_livenessProbe = '';
			// c_env = '';
			cmapRef = [];
			secRef = [];
			fldRef = [];
			volMount = [];

			e++;
			if (typeof obj[e] !== 'undefined') {
				// parse container definition
				c_name = obj[e].name;
				c_image = obj[e].image;
				vpk.containers[fnum].containerNames.push({'c_name': c_name, 'c_image': c_image})
				if (ctype === 'I') {
					vpk.containers[fnum].typeIcnt = vpk.containers[fnum].typeIcnt + 1;
				} else {
					vpk.containers[fnum].typeCcnt = vpk.containers[fnum].typeCcnt + 1;
				}

				// // command array 
				// if (typeof obj[e].command !== 'undefined') {
				// 	pStep = 'Command';
				// 	// c_command = obj[e].command;
				// 	// build array with the container env info
				// 	var cmkey = ns + '.' + c_image;
				// 	utl.checkType('Command', cmkey);
				// 	var tmpi = vpk['Command'][cmkey];
				// 	if (part === 'undefined') {
				// 		part = 0;
				// 	}
				// 	item = { 
				// 		'namespace': ns,
				// 		'kind': kind,
				// 		'objName': name,
				// 		'command': 'Y',
				// 		'image': c_image,
				// 		'sourceFile': src,
				// 		'sourcePart': part
				// 	};

				// 	tmpi.push(item);
				// 	vpk['Command'][cmkey] = tmpi;
				// 	utl.checkKind('Command','U');
				// 	utl.countKind('Command');

				// }
				
				// // args array
				// if (typeof obj[e].args !== 'undefined') {
				// 	pStep = 'Args';
				// 	// c_args = obj[e].args;
				// 	// build array with the container env info
				// 	var arkey = ns + '.' + c_image;
				// 	utl.checkType('Args', arkey);
				// 	tmpi = vpk['Args'][arkey];
				// 	item = {
				// 		'namespace': ns,
				// 		'kind': kind,
				// 		'objName': name,
				// 		'args': 'Y',
				// 		'image': c_image,
				// 		'sourceFile': src,
				// 		'sourcePart': part
				// 	};
				// 	tmpi.push(item);
				// 	vpk['Args'][arkey] = tmpi;
				// 	utl.checkKind('Args','U');
				// 	utl.countKind('Args');
				// }

				// // env
				// if (typeof obj[e].env !== 'undefined') {
				// 	pStep = 'Env';
				// 	c_env = obj[e].env;
				// 	// build array with the container env info
				// 	var evkey = ns + '.' + c_image;
				// 	utl.checkType('Env', evkey);
				//    	var tmpi = vpk['Env'][evkey];
				// 	item = {
				// 		'namespace': ns,
				// 		'kind': kind,
				// 		'objName': name,
				// 		'env': 'Y',
				// 		'image': c_image,
				// 		'sourceFile': src,
				// 		'sourcePart': part
				// 	};
				// 	tmpi.push(item);
				// 	vpk['Env'][evkey] = tmpi;
				// 	utl.checkKind('Env','U');
				// 	utl.countKind('Env');
				// }


				// // readinessProbe array
				// if (typeof obj[e].readinessProbe !== 'undefined') {
				// 	pStep = 'ReadinessProbe';
				// 	// c_readinessProbe = obj[e].readinessProbe;
				// 	// build array with the container liveness info
				// 	var rikey = ns + '.' + c_image;
				// 	utl.checkType('ReadinessProbe', rikey);
				//    	tmpi = vpk['ReadinessProbe'][rikey];
				// 	item = {
				// 		'namespace': ns,
				// 		'kind': kind,
				// 		'objName': name,
				// 		'readinessProbe': 'Y',
				// 		'image': c_image,
				// 		'sourceFile': src,
				// 		'sourcePart': part
				// 	};
				// 	tmpi.push(item);
				// 	vpk['ReadinessProbe'][rikey] = tmpi;
				// 	utl.checkKind('ReadinessProbe','U');
				// 	utl.countKind('ReadinessProbe');
				// }

				// // livenessProbe array
				// if (typeof obj[e].livenessProbe !== 'undefined') {
				// 	pStep = 'LivenessProbe';
				// 	// c_livenessProbe = obj[e].livenessProbe;
				// 	// build array with the container liveness info
				// 	var likey = ns + '.' + c_image;
				// 	utl.checkType('LivenessProbe', likey);
				// 	tmpi = vpk['LivenessProbe'][likey];
				// 	item = {
				// 		'namespace': ns,
				// 		'kind': kind,
				// 		'objName': name,
				// 		'livenessProbe': 'Y',
				// 		'image': c_image,
				// 		'sourceFile': src,
				// 		'sourcePart': part
				// 	};
				// 	tmpi.push(item);
				// 	vpk['LivenessProbe'][likey] = tmpi;
				// 	utl.checkKind('LivenessProbe','U');
				// 	utl.countKind('LivenessProbe');
				// }

				// build entries if ports exists
				if (typeof obj[e].ports !== 'undefined') {
					for (let p = 0; p < obj[e].ports.length; p++) {
						if (typeof obj[e].ports[p].containerPort !== 'undefined') {
							utl.containerLink(fnum, 'Ports', 'key', obj[e].ports[p].containerPort)
						}
					}
				}

				// build entries if configMapKeyRef exists
				if (typeof obj[e].env !== 'undefined') {
					var cfloop = true;
					var c = 0;
					if (typeof obj[e].env[c] == 'undefined') {
						cfloop = false;
					}

					// build  configMap, secret, and fieldRef entries if they exist
					while (cfloop) {
						pStep = 'CF_Loop'
						if (typeof obj[e].env[c].valueFrom !== 'undefined') {
							// var vkey = '';
							var vdata = {};
							vdata = {
								'namespace': ns,
								'kind': kind,
								'objName': name
							};
							if (typeof obj[e].env[c].valueFrom.secretKeyRef !== 'undefined') {
								pStep = 'Secret';
								vdata.type = 'secret';
								vdata.vname = obj[e].env[c].valueFrom.secretKeyRef.name;
								vdata.vkey = obj[e].env[c].valueFrom.secretKeyRef.key;
								secRef.push(vdata);

								// add the container volumeMount to cluster hierarchy
								hierarchy.addEntry(ns, kind, name, src, part, hval, c_name, 'Env', 'Secret', vdata.vname )
								utl.containerLink(fnum, 'Secret', obj[e].env[c].valueFrom.secretKeyRef.key, obj[e].env[c].valueFrom.secretKeyRef.name,'Env')

								// save info in use array
								// var seckey = ns + '.' + obj[e].env[c].valueFrom.secretKeyRef.name;
								// utl.checkType('SecretsUse', seckey);
								// var stmp = vpk['SecretsUse'][seckey];
								// var sUse = {
								// 	'namespace': ns,
								// 	'kind': kind,
								// 	'objName': name,
								// 	'secret': obj[e].env[c].valueFrom.secretKeyRef.name,
								// 	'key': obj[e].env[c].valueFrom.secretKeyRef.key,
								// 	'sourceFile': src,
								// 	'sourcePart': part
								// };
								// stmp.push(sUse);
								// vpk['SecretsUse'][seckey] = stmp;
								// utl.checkKind('SecretsUse','U');
								// utl.countKind('SecretsUse');
							}                            
							
							if (typeof obj[e].env[c].valueFrom.configMapKeyRef !== 'undefined') {
								pStep = 'ConfigMap';
								vdata.type = 'configMap';
								vdata.vname = obj[e].env[c].valueFrom.configMapKeyRef.name;
								vdata.vkey = obj[e].env[c].valueFrom.configMapKeyRef.key;
								cmapRef.push(vdata);

								// save info in use array
								// var cfkey = ns + '.' + obj[e].env[c].valueFrom.configMapKeyRef.name;
								// utl.checkType('ConfigMapUse', cfkey);
								// var ctmp = vpk['ConfigMapUse'][cfkey];
								// var cUse = {
								// 	'namespace': ns,
								// 	'kind': kind,
								// 	'objName': name,
								// 	'configMap': obj[e].env[c].valueFrom.configMapKeyRef.name,
								// 	'key': obj[e].env[c].valueFrom.configMapKeyRef.key,
								// 	'sourceFile': src,
								// 	'sourcePart': part
								// };
								// ctmp.push(cUse);

								// add the information to cluster hierarchy
								hierarchy.addEntry(ns, kind, name, src, part, hval, c_name, 'Env', 'ConfigMap', obj[e].env[c].valueFrom.configMapKeyRef.name )
								utl.containerLink(fnum, 'ConfigMap', obj[e].env[c].valueFrom.configMapKeyRef.key, obj[e].env[c].valueFrom.configMapKeyRef.name, 'Env')

								// vpk['ConfigMapUse'][cfkey] = ctmp;
								// utl.checkKind('ConfigMapUse','U');
								// utl.countKind('ConfigMapUse');
							}

							if (typeof obj[e].env[c].valueFrom.fieldRef !== 'undefined') {
								vdata.type = 'fieldRef';
								vdata.vname = obj[e].env[c].valueFrom.fieldRef.fieldPath;
								fldRef.push(vdata);
							}
						}
						c++;
						if (typeof obj[e].env[c] === 'undefined') {
							cfloop = false;
						}
					}
				}


				
				// check for volumeMounts
				if (typeof obj[e].volumeMounts !== 'undefined') {
					pStep = 'VolumeMounts';
					var vloop = true;
					var v = 0;
					
					if (typeof obj[e].volumeMounts[v] == 'undefined') {
						vloop = false;
					} 
					
					// build  configMap, secret, and fieldRef entries if they exist
					while (vloop) {
						pStep = 'VolumeMounts_Loop';
						var voldata = {};
						var mountPath = '';
						var mountName = '';
						voldata = {
							'namespace': ns,
							'kind': kind,
							'objName': name
						};
						if (typeof obj[e].volumeMounts[v].name !== 'undefined') {
							mountName = obj[e].volumeMounts[v].name;
							if (typeof obj[e].volumeMounts[v].name !== 'undefined') {
								mountPath = obj[e].volumeMounts[v].mountPath;
							}
						}
						volMount.mountName = mountName;
						volMount.mountPath = mountPath;
						volMount.push(voldata);

						// create / update volumeMounts
						pStep = 'VolumeMount';
						var vmkey = ns + '.' + 'VolumeMount' + '.' + mountName;
						utl.checkType('VolumeMount', vmkey);
						var tmpm = vpk['VolumeMount'][vmkey];
						var item = {
							'namespace': ns,
							'kind': 'VolumeMount',
							'objName': mountName,
							'mountPath': mountPath, 
							'mountName': mountName,
							'sourceFile': src,
							'sourcePart': part
						};
						tmpm.push(item);
						vpk['VolumeMount'][vmkey] = tmpm;
						// utl.checkKind('VolumeMount','U');
						utl.countKind('VolumeMount');

						// add the container volumeMount to cluster hierarchy
						hierarchy.addEntry(ns, kind, name, src, part, hval, c_name, 'VolumeMounts', mountName )
						utl.containerLink(fnum, 'VolumeMounts', mountName, mountPath)

						// vmkey = ns + '.' + mountName;
						// pStep = 'VolumeMountUse';
						// utl.checkType('VolumeMountUse', vmkey);
						// var tmpv = vpk['VolumeMountUse'][vmkey];
						// item = {
						// 	'namespace': ns,
						// 	'kind': kind,
						// 	'objName': name,
						// 	'sourceFile': src,
						// 	'sourcePart': part
						// };
						// tmpv.push(item);
						// vpk['VolumeMountUse'][vmkey] = tmpv;
						// utl.checkKind('VolumeMountUse','U');
						// utl.countKind('VolumeMountUse');

						v++;
						if (typeof obj[e].volumeMounts[v] === 'undefined') {
							vloop = false;
						}
					}
				}

				// add the container to cluster hierarchy
				hierarchy.addEntry(ns, kind, name, src, part, hval, c_name )

				// build array with the container name
				pStep = 'ContainerName';
				var ckey = ns + '.' + c_name;
				utl.checkType('ContainerName', ckey);
				var tmpc = vpk['ContainerName'][ckey];
				item = {
					'namespace': ns,
					'kind': kind,
					'objName': name,
					'containerRefName': c_name,
					'image': c_image,
					'sourceFile': src,
					'sourcePart': part
				};
				tmpc.push(item);
				vpk['ContainerName'][ckey] = tmpc;
				// utl.checkKind('ContainerName','U');
				utl.countKind('ContainerName');


				// build array with the docker container image name
				pStep = 'ContainerImage';
				var cikey = ns + '.' + c_image;
				utl.checkType('ContainerImage', cikey);
				tmpi = vpk['ContainerImage'][cikey];
				item = {
					'namespace': ns,
					'kind': kind,
					'objName': name,
					'containerRefName': c_name,
					'image': c_image,
					'sourceFile': src,
					'sourcePart': part
				};
				tmpi.push(item);
				vpk['ContainerImage'][cikey] = tmpi;
				// utl.checkKind('ContainerImage','U');
				utl.countKind('ContainerImage');
				
				// xref container image
				// pStep = 'ContainerImageUse';
				// var xkey = ns + '.' + c_image;
				// utl.checkType('ContainerImageUse', xkey);
				// var tmpu = vpk['ContainerImageUse'][xkey];
				// item = {
				// 	'namespace': ns,
				// 	'kind': kind,
				// 	'objName': name,
				// 	'containerRefName': c_name,
				// 	'image': c_image,
				// 	'sourceFile': src,
				// 	'sourcePart': part
				// };
				// tmpu.push(item);
				// vpk['ContainerImageUse'][xkey] = tmpu;
				// utl.checkKind('ContainerImageUse','U');
				// utl.countKind('ContainerImageUse');
			} else {
				doit = false;
			}

			// safety stop
			if (e > 100) {
				doit = false;
			}
		}

	} catch (err) {
		utl.logMsg('vpkCNT001 - Error processing file: ' + src + ' part: ' + part + ' container entry: ' + c_name + ' message: ' + err + ' InRoutine: ' + pStep );
	}

};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

	parse: function(ns, kind, name, obj, rCnt, src, part, containerType, fnum) {

		if (typeof fnum === 'undefined' || fnum === '' || fnum === 0 || fnum === ':') {
			utl.logMsg('vpkCNT999 - Error processing, invalid fnum: fnum for file: ' + src + ' part: ' + part );
			return;
		}

		parseContainer(ns, kind, name, obj, rCnt, src, part, containerType, fnum);

	}

};