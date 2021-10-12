/*
Copyright (c) 2018-2021 K8Debug

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
// build data for cluster tab
//----------------------------------------------------------


let canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };

let foundNSNames = [];

// hide the right column in the 3d view
// function hideColumn() {
//     const wrapper = document.querySelector(".cluster-wrap");
//     let checkString = JSON.stringify(wrapper.classList, null, 2);
//     if (checkString.indexOf('cluster-hide') > -1) {
//         wrapper.classList.toggle("cluster-hide");
//     }
// }


function set3dBackColor(r,g,b, title) {
    sceneColorR = r / 255;
    sceneColorG = g / 255;
    sceneColorB = b / 255;
    $("#colorTitle").html(title);
    if (title === 'Straw' || title === 'Grey' || title === 'Lavender' || title === 'Olive' || title === 'Teal' || title === 'White') {
        stickColorDark = false;
    } else {
        stickColorDark = true;
    }
}

function populate3DSelectNS() {
    if (foundNSNamesBuilt === true) {
        return
    }
    // filter bar1 (namespaces) and grapcis and cluster drop downs
    let data = bldOptions(foundNSNames, 'N', 'select2');

    $("#cluster-ns-filter").empty();
    $("#cluster-ns-filter").select2({ 
        data: data,
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md"
    });
    foundNSNamesBuilt = true;
}

function build3DJSON() {
    foundNSNames = [];
    if (window.hasOwnProperty('cluster')) {
        window.cluster = {};
        console.log('Previous cluster JSON data sturcture located and cleared')
    } else {
        window.cluster = {};
        console.log('Empty cluster JSON data sturcture created')
    } 
    if (typeof k8cData['0000-clusterLevel'] !== 'undefined') {
        if (typeof k8cData['0000-clusterLevel'].Node !== 'undefined') {
            let nData = k8cData['0000-clusterLevel'].Node;
            cluster.nodes = nData;
            cluster.maxNodes = nData.length;
            populatePods();
            //console.log(JSON.stringify(cluster.nodes,null,2))
        }
    }
    // populate drop down filter with located NS values
    populate3DSelectNS();
}

function populatePods() {
    let keys = Object.keys(k8cData);
    for (let i = 0; i < keys.length; i++) {
        if (typeof k8cData[keys[i]].kind !== 'undefined') {
            if (k8cData[keys[i]].kind === 'Pod') {
                // save unique array list of namespaces 
                if (!foundNSNames.includes(k8cData[keys[i]].namespace)) {
                    foundNSNames.push(k8cData[keys[i]].namespace)
                }

                let pod = {};
                // console.log(JSON.stringify(k8cData[keys[i]],null,2))
                let nodeName = k8cData[keys[i]].node;
                pod.name = k8cData[keys[i]].name;
                pod.ns = k8cData[keys[i]].namespace;
                pod.fnum = k8cData[keys[i]].fnum;
                pod.phase = k8cData[keys[i]].phase;
                if (pod.phase === 'Running') {
                    pod.status = 1;
                } else if (pod.phase === 'Failed') {
                    pod.status = 2;
                } else if (pod.phase === 'Succeeded') {
                    pod.status = 4;
                } else {                    
                    console.log('Pod phase:' + pod.phase)
                    pod.status = 3;
                }

                if (k8cData[keys[i]].daemonSetPod === true) {
                    pod.status = 0;
                }

                if (typeof k8cData[keys[i]].status.conditions !== 'undefined') {
                    pod.conditions = k8cData[keys[i]].status.conditions;
                } else {
                    pod.conditions = [];
                }
                if (typeof k8cData[keys[i]].PersistentVolumeClaim !== 'undefined') {
                    if (typeof k8cData[keys[i]].PersistentVolumeClaim[0] !== 'undefined') {
                        pod.pvc = [{
                            'name': k8cData[keys[i]].PersistentVolumeClaim[0].pvcName,
                            'fnum': k8cData[keys[i]].PersistentVolumeClaim[0].pvcFnum,
                            'storageClassName': k8cData[keys[i]].PersistentVolumeClaim[0].storageClassName,
                            'storageClassFnum': k8cData[keys[i]].PersistentVolumeClaim[0].storageClassFnum
                        }] 
                    } else {
                        pod.pvc = [];
                    }
                } else {
                    pod.pvc = false;
                }

                if (typeof k8cData[keys[i]].Services !== 'undefined') {
                    pod.serviceFound = true;
                    pod.services = [];
                    let chkStr = ':';
                    for (let s = 0; s < k8cData[keys[i]].Services.length; s++) {
                        if (chkStr.indexOf(':'+k8cData[keys[i]].Services[s].fnum+':') === -1) {
                            let sData = k8cData[keys[i]].Services[s];
                            pod.services.push(k8cData[keys[i]].Services[s])
                            chkStr = chkStr + k8cData[keys[i]].Services[s].fnum + ':';
                        }
                    }
                } else {
                    pod.serviceFound = false;
                    pod.services = [];
                }

                //console.log(JSON.stringify(pod, null, 2))
                addPodToNode(pod, nodeName);
            }
        }
    }
}

function addPodToNode(pod, nodeName) {
    for (let n = 0; n < cluster.nodes.length; n++) {
        if (cluster.nodes[n].name === nodeName) {
            if (typeof cluster.nodes[n].pods === 'undefined') {
                cluster.nodes[n].pods = [];
            }
            
            cluster.nodes[n].pods.push(pod)
            break;
        }
    }
}

//////////////////////////////////////////////////////////////////////////////

const createScene = function () {

    // reset properties to initial value

    let RADIUSINNER = 2;                    // radius for inner/first wall cylinder
    let bandPositions;                      // array of band positions
    let WALL_HEIGHT = 0.1;                  // controls heigth of wall, not bands
    let LINEFACTOR = .55;
    let INNERFACTOR = 0.5;
    let OUTTERFACTOR = 1.0;
    let PI2 = 6.283185307179586;
    let NODE_ICON_ADJ = .75; 
    let MST_TYPE = 'Master';
    let WRK_TYPE = 'Worker';
    let NODE_NAME = 'Name: ';
    let NODE_TYPE = 'Type:';
    let NODE_HEIGTH = 1.0;
    let POD_HEIGTH = 0.30;
    let POD_SIZE = 0.20;
    let RES_NAME = 'Name:';
    let RES_STATUS = 'Status:';
    let RES_NS = 'NS:';

    let aV = 0;
    let angle = 0;
    let angleArray = [];
    let nodePtr = 0;
    let bldWall = true;
    let pX, sX;  
    let pY, sY;
    let pZ, sZ;
    let nodeCnt = cluster.maxNodes;
    let currentNode = 0;
    let maxRings = 0;
    let namespaces = '';
    let tmp;

    // set the maxium to be used to build nodes and walls.  Two times the number of nodes.
    let max = cluster.maxNodes * 2;
    // if no nodes defined set to one empty node
    if (max === 0) {
        max = 2
    }

    // build array of all angles that will be used to place pods
    for (let a = 0; a < 360; a++) {
        angleArray.push(aV)
        aV += PI2 / 360;
    }

    // get namespace filters if defined
    let options = $('#cluster-ns-filter').select2('data');
    for (let i = 0; i < options.length; i++) {
        tmp = options[i].text;
        tmp = tmp.trim();
        if (tmp.length === 0) {
            namespaces = namespaces + ':all-namespaces:';
        } else {
            namespaces = namespaces + ':' + tmp + ':';
        }
    };

    if (namespaces === '') {
        namespaces = ':all-namespaces:';
    }

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(sceneColorR, sceneColorG, sceneColorB);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 30, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    const light  = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3( 0,  50, 0));
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(10, -50, 0));

    const clickSound = new BABYLON.Sound("clickSound", "sounds/LowDing.wav", scene);

    // build materials with colors for nodes and pods
    let mstNodeMat = new BABYLON.StandardMaterial("nMstMat", scene);
    mstNodeMat.diffuseColor = new BABYLON.Color3(0.65, 0.25, 0.25);

    let wrkNodeMat = new BABYLON.StandardMaterial("nWrkMat", scene);
    wrkNodeMat.diffuseColor = new BABYLON.Color3(0.90, 0.90, 0.90);

    let podRed = new BABYLON.StandardMaterial("podRedMat", scene);
    podRed.diffuseColor = new BABYLON.Color3(1.0, 0.0, 0.0);

    let podGreen = new BABYLON.StandardMaterial("podGreenMat", scene);
    podGreen.diffuseColor = new BABYLON.Color3(0.0, 1.0, 0.0);
    
    let podYellow = new BABYLON.StandardMaterial("podYellowMat", scene);
    podYellow.diffuseColor = new BABYLON.Color3(1.0, 1.0, 0.0);

    let podPurple = new BABYLON.StandardMaterial("podPurbleMat", scene);
    podPurple.diffuseColor = new BABYLON.Color3(1.0, 0.0, 1.0);

    let podGrey = new BABYLON.StandardMaterial("podGreyMat", scene);
    podGrey.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    let serviceColor = new BABYLON.StandardMaterial("serviceColorMat", scene);
    serviceColor.diffuseColor = new BABYLON.Color3(0.5, 0.75, 0.75);

    let pvcColor = new BABYLON.StandardMaterial("serviceColorMat", scene);
    pvcColor.diffuseColor = new BABYLON.Color3(0.75, 0.75, 0.10);

    let stickColor = new BABYLON.StandardMaterial("serviceColorMat", scene);
    if (stickColorDark === true) {
        stickColor.diffuseColor = new BABYLON.Color3(1, 1, 1);
    } else {
        stickColor.diffuseColor = new BABYLON.Color3(.20, .20, .20);
    }


    // Build inner band for cluster
    const band1 = BABYLON.MeshBuilder.CreateTube("band1", {
        path: [ new BABYLON.Vector3(0.0, 0.0, 0.0), new BABYLON.Vector3(0.0, WALL_HEIGHT, 0.0) ], 
        radius: RADIUSINNER, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene );
    bandPositions = band1.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    band1.setVerticesData(BABYLON.VertexBuffer.ColorKind, setColor(bandPositions, 0.70, 0.70, 0.70));

    //==================== Common functions ====================

    // Routine to build outter band of cluster 
    function buildOutterRing(rad) {
        // Good / Green band
        const band2 = BABYLON.MeshBuilder.CreateTube("band2", {
            path: [ new BABYLON.Vector3(0.0, 0.0, 0.0), new BABYLON.Vector3(0.0, WALL_HEIGHT, 0.0) ], 
            radius: rad, 
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
            }, scene);
            bandPositions = band2.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        band2.setVerticesData(BABYLON.VertexBuffer.ColorKind, setColor(bandPositions, 0.70, 0.70, 0.70));
    }

    //Set colors for band / ring
    function setColor(posi, c1, c2, c3) {
        let colors = [];
        for(var p = 0; p < posi.length / 3; p++) {
            colors.push(c1, c2, c3, 1);
        }
        return colors;
    }

    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            /* next line works with strings and numbers, 
             * and you may want to customize it to your needs
             */
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    function dynamicSortMultiple() {
        /*
         * save the arguments object as it will be overwritten
         * note that arguments object is an array-like object
         * consisting of the names of the properties to sort by
         */
        var props = arguments;
        return function (obj1, obj2) {
            var i = 0, result = 0, numberOfProperties = props.length;
            /* try getting a different result from 0 (equal)
             * as long as we have extra properties to compare
             */
            while(result === 0 && i < numberOfProperties) {
                result = dynamicSort(props[i])(obj1, obj2);
                i++;
            }
            return result;
        }
    }

    //==============================================
    // build the pods to display in the cluster view
    function bldResources(start, stop, node) {

        // set node to proper location in cluster by subtracting one
        node = node - 1;                    
        let lc = 0;
        let nLen = (lc * LINEFACTOR) + RADIUSINNER + INNERFACTOR;
        let lineMax = 0;
        let cPtr = start;
        let cCnt = 0;
        let pClr;
        let bldCnt = 0;
        let pName; 
        let pCords;
        let sName;
        let vName;

        // set maximum pods per ring
        if ((stop - start) < 2) {
            lineMax = 1
        } else {
            lineMax = (stop - start);
        }

        // Get the number of pods in the node
        // console.log('look')
        if (typeof cluster.nodes[node].pods === 'undefined') {
            console.log(cluster.nodes[node].name + ' has no pods')
            return
        } 
        let podCnt = cluster.nodes[node].pods.length;

        let newData = cluster.nodes[node].pods;
        newData.sort(dynamicSortMultiple("status", "name"));
        cluster.nodes[node].pods = newData;


        for (cCnt = 0; cCnt < podCnt; cCnt++ ) {
            // check if ring is full, if so, add new ring
            if (cPtr > stop) { 
                // reset pointer 
                cPtr = start
                // increase length counter
                lc++;
                // increase length pointer
                nLen = (lc * LINEFACTOR) + RADIUSINNER + INNERFACTOR;
                // reset counter for pods built at this lenght pointer 
                bldCnt = 0;
            }

            let ns = cluster.nodes[node].pods[cCnt].ns;

            // // Set pod color and name for display
            pClr = cluster.nodes[node].pods[cCnt].status;

            pName = '<div class="vpkfont vpkcolor ml-4">'
            + '<a href="javascript:getDefFnum(\'' + cluster.nodes[node].pods[cCnt].fnum + '\')">'
            + '<img src="images/k8/pod.svg" style="width:40px;height:40px;"></a>'
            + '<span class="pl-3"><b>' + RES_STATUS + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].phase + '</span>'
            + '<span class="pl-3"><b>' + RES_NAME + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].name + '</span>'
            + '<span class="pl-3"><b>' + RES_NS + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].ns + '</span>'
            + '&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp<span class="pl-3 vpkfont-sm">(Press icon to view resource yaml)</span></div>' 


            pCords = buildPodObj(angleArray[cPtr], nLen, 'N_' + node + '_P_' + cCnt, pClr, pName, ns)

            // should network services sphere be shown
            if (cluster.nodes[node].pods[cCnt].services.length > 0) {
                sName = '<div class="vpkfont vpkcolor ml-4">'
                + '<a href="javascript:getDefFnum(\'' + cluster.nodes[node].pods[cCnt].services[0].fnum + '\')">'
                + '<img src="images/k8/svc.svg" style="width:40px;height:40px;"></a>'
                + '<span class="pl-3"><b>' + RES_NAME + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].services[0].name + '</span>'
                + '<span class="pl-3"><b>' + RES_NS + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].services[0].namespace+ '</span>'
                + '&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp<span class="pl-3 vpkfont-sm">(Press icon to view resource yaml)</span></div>' 

                buildServiceObj(pCords, sName, cluster.nodes[node].pods[cCnt].services[0].namespace)
            }

            if (cluster.nodes[node].pods[cCnt].pvc.length > 0 ) {

                vName = '<div class="vpkfont vpkcolor ml-4">'
                + '<a href="javascript:getDefFnum(\'' + cluster.nodes[node].pods[cCnt].pvc[0].fnum + '\')">'
                + '<img src="images/k8/pvc.svg" style="width:40px;height:40px;"></a>'
                + '<span class="pl-3"><b>' + RES_NAME + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].pvc[0].name + '</span>'
                + '<span class="pl-3"><b>' + RES_NS + '&nbsp;&nbsp;</b>' + cluster.nodes[node].pods[cCnt].ns+ '</span>'
                + '&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp<span class="pl-3 vpkfont-sm">(Press icon to view resource yaml)</span></div>' 

                buildPVCObj(pCords, vName, cluster.nodes[node].pods[cCnt].ns)
            }

            bldCnt++

            // Control spacing between pods
            if (lc > 1 ) {
                cPtr = cPtr + 4;
            } else {
                cPtr = cPtr + 5;
            }
        }
        // Update maxRings so outter band/ring is properly placed
        if (maxRings < lc) {
            maxRings = lc;
        }
    }

   
    function buildPVCObj(pCords, vName, ns) {
        // Does the namespace get shown
        if (!checkNamespace(ns)) {
            return;
        }

        // Are storage PVCs shown
        if($('#clusterFilterStorage').prop('checked')){

            let pvc = BABYLON.MeshBuilder.CreateCylinder("pvc", {height: .4, diameterTop: .25, diameterBottom: .25, tessellation: 16});
            // Move the object 
            pvc.position.y = pCords.y - 5;
            pvc.position.x = pCords.x;
            pvc.position.z = pCords.z;
            pvc.material = pvcColor;

            // register click event for each PVC;
            pvc.actionManager = new BABYLON.ActionManager(scene);
            pvc.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                    function () {
                    document.getElementById("resourceProps").innerHTML = vName;
                    if($('#clusterFilterSound').prop('checked')){
                        clickSound.play();
                    }
                }
            ));

            let stick = BABYLON.MeshBuilder.CreateCylinder("stick", {height: 5.0, diameterTop: .01, diameterBottom: .01, tessellation: 4});
            // Move the stick
            stick.position.y = pCords.y + -2.55;
            stick.position.x = pCords.x;
            stick.position.z = pCords.z;
            stick.material = stickColor;
        }
    }


    function buildServiceObj(pCords, sName, ns) {
        // Does the namespace get shown
        if (!checkNamespace(ns)) {
            return;
        }

        // Are network items shown
        if($('#clusterFilterNetwork').prop('checked')){
            let sphere = BABYLON.MeshBuilder.CreateSphere("service", {diameter: .175, segments: 32}, scene);
            // Move the sphere 
            sphere.position.y = pCords.y + 5;
            sphere.position.x = pCords.x;
            sphere.position.z = pCords.z;
            sphere.material = serviceColor;

            // register click event for each pod;
            sphere.actionManager = new BABYLON.ActionManager(scene);
            sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                    function () {
                    document.getElementById("resourceProps").innerHTML = sName;
                    if($('#clusterFilterSound').prop('checked')){
                        clickSound.play();
                    }
                }
            ));

            let stick = BABYLON.MeshBuilder.CreateCylinder("stick", {height: 5.0, diameterTop: .01, diameterBottom: .01, tessellation: 4});
            // Move the stick
            stick.position.y = pCords.y + 2.55;
            stick.position.x = pCords.x;
            stick.position.z = pCords.z;
            stick.material = stickColor;
        }
    }


    //==============================================
    // should namespace be shown
    function checkNamespace(ns) {
        if (namespaces.indexOf(':all-namespaces:') === -1 ) {
            console.log(namespaces + '   ns: ' + ns)
            // if ns is not in the list skip building the pod
            if (namespaces.indexOf(':' + ns + ':') === -1) {
                return false;    // not found
            } else {
                return true;     // process this namespace
            }
        }  else {
            return true;         // all-namespaces are selected
        }      
    }


    //==============================================
    // build a sphere for the pod
    function buildPodObj(iAngle, iLen, p, clr, name, ns) {

        let wX;
        let wY;
        let wZ;

        // Calculate where is the point to build the Pod
        wX = iLen * Math.sin(iAngle);
        wY = 0;
        wZ = iLen * Math.cos(iAngle);

        // Does the namespace get shown
        if (!checkNamespace(ns)) {
            return {'x': wX, 'y': wY, 'z': wZ};
        }

        // Are pods shown
        if($('#clusterFilterPods').prop('checked')){

            // determine if DaemonSet pops is shown
            if (clr === 0 || clr === '0') {
                let chkDSPod = $('#clusterFilterDSPods').prop('checked');
                if(!chkDSPod){
                    return {'x': wX, 'y': wY, 'z': wZ}; 
                }
            }

            let pod = BABYLON.MeshBuilder.CreateCylinder("pod_" + p, {height: POD_HEIGTH, diameterTop: POD_SIZE, diameterBottom: POD_SIZE, tessellation: 6});
            pod.position.y = wY;
            pod.position.x = wX;
            pod.position.z = wZ;;
            
            if (clr === 1 || clr === '1') {
                pod.material = podGreen;
            } else if (clr === 2 || clr === '2') {
                pod.material = podRed;
            } else if (clr === 3 || clr === '3') {
                pod.material = podYellow;
            } else if (clr === 4 || clr === '4') {
                pod.material = podPurple;
            } else if (clr === 0 || clr === '0') {
                pod.material = podGrey;
            }

            // register click event for each pod;
            pod.actionManager = new BABYLON.ActionManager(scene);
            pod.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                    function () {
                    document.getElementById("resourceProps").innerHTML = name;
                    if($('#clusterFilterSound').prop('checked')){
                        clickSound.play();
                    }
                }
            ));
        }
        return {'x': wX, 'y': wY, 'z': wZ};
    }


    //==============================================
    // Build the walls to seperate the Nodes
    function createWall(x, y, z, sX, sY, sZ, h, i) {
        //Material on front and back of custom mesh
        let wallMat = new BABYLON.StandardMaterial("mat" + i, scene);
        wallMat.backFaceCulling = false;
        wallMat.diffuseColor = new BABYLON.Color3(0.725, 0.725, 0.725);


        //Create a custom mesh  
        let customMesh = new BABYLON.Mesh("wall" + i, scene);
        //Set arrays for positions and indices
        let posi = [sX, sY, sZ,   x, y, z,   x, h, z,   sX, h, sZ];
        let indices = [0, 1, 2, 2, 3, 0];	
        //Empty array to contain calculated values
        var normals = [];
        var vertexData = new BABYLON.VertexData();
        BABYLON.VertexData.ComputeNormals(posi, indices, normals);

        //Assign positions, indices and normals to vertexData
        vertexData.positions = posi;
        vertexData.indices = indices;
        vertexData.normals = normals;
        //Apply vertexData to custom mesh
        vertexData.applyToMesh(customMesh);

        customMesh.material = wallMat;
    }


    //==============================================
    // End of common functions
    //==============================================


    //---------------------------------------------------
    // Build pods for each node.  First calculate angleArray start and stop entries to use
    //---------------------------------------------------
    for (let n = 0; n < cluster.maxNodes; n++) {
        currentNode++;
        let gblCnt = 360 / nodeCnt;  
        let start;
        let stop;
        gblCnt = parseInt(gblCnt,10);
        if (currentNode === 1) {
            stop = gblCnt - 1;
            if (nodeCnt === 48) {
                start = 1;
            } else {
                start = 2;
            }
            bldResources(start, stop, currentNode)
        } else {
            let totV = currentNode * gblCnt;
            start = (totV - gblCnt) + 4;
            stop = totV - 4;
            bldResources(start, stop, currentNode)
        }
    }


    //---------------------------------------------------
    // Build outter band/ring and walls for each node
    //---------------------------------------------------
    maxRings = (maxRings * LINEFACTOR) + RADIUSINNER + OUTTERFACTOR;
    buildOutterRing(maxRings);

    // loop and build node walls and node objects
    for (let index = 0; index < max; index++) {

        if (bldWall === false) {
            // set x,y,z points for node icon
            pX = (maxRings + NODE_ICON_ADJ) * Math.sin(angle);
            pY = 0;
            pZ = (maxRings + NODE_ICON_ADJ) * Math.cos(angle);

            // Determine if node resources are drawn
            if($('#clusterFilterNodes').prop('checked')){

                let can = BABYLON.MeshBuilder.CreateCylinder("node" + index, {height: NODE_HEIGTH, tessellation: 4});
                can.position.y = pY;
                can.position.x = pX;
                can.position.z = pZ;
                let nType = '';

                // "m" is a Master node, otherwise treat as worker node
                if (cluster.nodes[nodePtr].type === "m") {
                    can.material = mstNodeMat;
                    nType = MST_TYPE;
                } else {
                    can.material = wrkNodeMat;
                    nType = WRK_TYPE;
                }

                let nName = cluster.nodes[nodePtr].name;
                let nTxt = '<div class="vpkfont vpkcolor ml-4">'
                    + '<a href="javascript:getDefFnum(\'' + cluster.nodes[nodePtr].fnum + '\')">'
                    + '<img src="images/k8/node.svg" style="width:40px;height:40px;"></a>'
                    + '<span class="pl-3 pr-3"><b>Node ' + NODE_TYPE + '&nbsp;&nbsp;</b>' + nType + '</span>' 
                    + '<span class="pl-3"><b>' + NODE_NAME + '&nbsp;&nbsp;</b>' + nName + '</span>'
                    + '&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp<span class="pl-3 vpkfont-sm">(Press icon to view resource yaml)</span></div>' 

                // register click event for each node;
                can.actionManager = new BABYLON.ActionManager(scene);
                can.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    function () {
                        document.getElementById("resourceProps").innerHTML = nTxt;
                        if($('#clusterFilterSound').prop('checked')){
                            clickSound.play();
                        }
                    }
                ));
            } 

            bldWall = true;
            nodePtr++;

        } else {
            // set start points for wall
            sX = RADIUSINNER * Math.sin(angle);
            sY = 0;
            sZ = RADIUSINNER * Math.cos(angle);
            // set end points for wall
            pX = maxRings * Math.sin(angle);
            pY = 0;
            pZ = maxRings * Math.cos(angle);
            // if single node in cluster no wall is built 
            if (max !== 2) {    
                createWall(pX, pY, pZ, sX, sY, sZ, WALL_HEIGHT, index)
                bldWall = false;
            } else {
                bldWall = false;
            }
        }
        // update angle for next item to be defined
        angle += PI2 / max;
    }
    // return the newly built scene to the calling function
    return scene;
}


function build3DView() {
    window.initFunction = async function() {
        
        var asyncEngineCreation = async function() {
            try {
                return createDefaultEngine();
            } catch(e) {
                alert("Create 3D engine function failed. Creating the default engine instead")
                console.log("Create 3D engine function failed. Creating the default engine instead");
                return createDefaultEngine();
            }
        }

        window.engine = await asyncEngineCreation();
        
        if (!engine) {
            throw 'engine should not be null.';
        }

        window.scene = createScene();
    };

    initFunction().then(() => {sceneToRender = scene        
        engine.runRenderLoop(function () {
            if (sceneToRender && sceneToRender.activeCamera) {
                sceneToRender.render();
            }
        });
    });

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
}


//----------------------------------------------------------
console.log('loaded vpkcluster3D.js');