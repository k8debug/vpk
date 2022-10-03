/*
Copyright (c) 2018-2022 K8Debug

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

/*

Global VPK object.

*/
let vpk = module.exports = {
   ownerLinks: {},
   ownerRefs: [],
   childRefs: [],
   svcspec: [],
   daemonSetPods: [],
   nodesFnum: [],
   validDir: true,
   resetReq: false,
   csiDriverName: {},
   csiNodeFnum: {},
   pvCsi: [],
   spaceReqSC: {},
   spaceReqPVC: [],
   volumeTypes: {},
   volumeInfo: [],
   storageInfo: {},
   explains: {},
   ownerChains: {},
   roleRefRole: {},
   subjectMissingCnt: 0,
   defaultSettings: {},
   namespaceCnt: {},
   fileCnt: {},
   crds: {},
   subjects: {},
   roleFnum: {},
   clusterRoleFnum: {},
   controllerRevision: {},
   schematicBuilt: false,
   allKeys: [],
   serviceAccounts: {},
   podList: {},
   hpaLinks: {},
   apis: {},
   owners: {},
   allUids: {},
   apiFnum: [],
   roleBindingFnum: {},
   clusterRoleBindingFnum: {},
   secretFnum: {},
   fnumUsed: [],
   eventMessage: [],
   svgMsg: [],
   storageClassName: {},
   storageClassLinks: {},
   pvFnum: {},
   pvLabels: {},
   pvcFnum: {},
   pvcLinks: {},
   pvcNames: {},
   ownerNumber: 100000,
   ownerUids: {},
   endpointSliceService: {},
   endpointSliceLinks: {},
   endpointsLinks: {},
   servicePorts: {},
   serviceFnum: {},
   serviceLabels: {},
   serviceName: {},
   serviceNoSelector: {},
   containers: {},

   // validation failure counts
   vCnt: 0,
   tCnt: 0,
   rCnt: 0,
   pCnt: 0,
   repCnt: 0,

   //global work vars for files and directories
   baseFS: '',
   filesFS: [],
   dirFS: [],
   dirPtr: -1,
   dirname: '',

   //starting directory name
   startDir: '-none-',

   //process flag
   loop: true,

   //run stats
   dCnt: 0,
   fCnt: 0,
   yCnt: 0,
   xCnt: 0,
   dupCnt: 0,

   yaml: '',
   yBASE: 0,

   k_cont: new Object(),

   file_sources: [],
   file_id: 0,

   genericType: ':',

   kinds: {},
   kindStats: {},

   definedNamespaces: {
      'all-namespaces': 'all-namespaces'
   },

   generic: {},
   genericCnt: 0,

   vpkLogMsg: [],

   cmdHist: [],

   apitypes: [],

   counts: [],

   kindList: '',

   rtn: {},

   //relations: {},

   dropManagedFields: true,

   dropStatus: true,

   hierarchy: {},

   hierarchyFile: {},

   fileNames: [],

   fileContent: {},

   fileContentCnt: 0,

   labelKeys: [],

   uid: {},

   xrefDefined: '#$@',

   //last var/holder
   do_not_delete: 'do not delete'
};
