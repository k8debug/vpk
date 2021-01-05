<img style="float: center;" src="https://raw.githubusercontent.com/k8debug/vpk/main/public/images/vpk.png" width="70" height="70">

## Visual parsed Kubernetes 
---

VpK was created as the result of wanting a tool to aid in understanding what is defined in Kubernetes.   

VpK is comprised of a server and browser components.  The server component is a node.js application that communictes with running instances of K8 using the kubectl CLI application.  When using K8 versions that require a custom CLI tool to query Kubernets, e.g. OpenShift, MicroK8s, etc. the associated tool is used to query the cluster.  Using the kubectl api-resource command, a list of all known resources can be obtained.  Using this information all K8 resources support the 'get' verb are quired using kubectl get.  The output from the get requests used to create a seperate file for each unique resource.  These files are created on the user laptop.  At this point VpK no longer communicates with the K8 instance. 

The user interface (UI), browser component, provides graphical and tabular views of resources defined and deployed in the cluster.

What is VpK? 

- VpK is designed to capture a point-in-time snapshot of the cluster.

- Vpk provides the ability to view the captured snapshot in a disconnected fashion.  Once the snapshot is created the user no longer needs to be connected to the cluster.

- Vpk will __not__ modify a K8 cluster.  It is designed as read-only.

- VpK is __not__ a realtime monitoring tool. 

- Access running K8 instances via CLI and saving results in locally stored directory.

- The locally stored K8 query results allow disconnected use of VpK once a successful retrieval of K8 resource information.
 
- Tabular viewing of resources with the abilty to filter by namespaces, kinds, labels, and resource names.

- Fully expanded or collapsible hierarchial views of K8 resources.  

- Circlepack view of K8 resouces.  

- Schematic views of running workloads in the cluster.

- Views of roles, bindings, and subject used to define RBAC.

- Usage of RBAC definitions.

- Create and view custom cross reference information of K8 resource elements.	
<br><br>

## Vpk Architecture

![Architecture](https://raw.githubusercontent.com/k8debug/vpk/main/public/docs//docimages/architecture.png)

<br><br>

## Installation
	
__Node.js__ and __npm__ are required to install and execute this application.

You cannot install and run this application without first installing node.js and npm.  After the prerequisites are installed proceed to the next step. 

Download the source files and place in a directory.  The source files are available on github and can be downloaded using the following clone command or retrieved 

git clone http://github.com/k8debug/vpk.git/ 

Change to the directory where the files were placed. Run the following command to install the required Node modules:

	npm install

Once the above has successfully completed the application can be started.  


<br><br>

## Updating software

There is no automated process to update an existing version of this software.   A complete new install is required.  Follow the above __'Installation'__ instructions to install a new version of the software.

<br><br>

## Start parameters

Start the VpK server by running either of the followings command from the directory where the software is installed.

```
npm start (or) node server.js  
```


VpK has an optional start parameters for the port of where the browser can access the application.   The default value for the port is 4200.  The following example starts the server using port 3000 and not the default.

```
node server.js  -p 3000   
``` 

Once the server is started open a browser using the appropriate port.

```
http://localhost:4200 
``` 

<br><br>

## Usage

To assist in understanding YouTube videos are available that discuss may of the features of the product.
Videos are sorted alpha by topic.

https://youtu.be/8LtXugxdASY - Cluster view  
https://youtu.be/pykzLsiAcP4 - Custom X-Refs (cross references)  
https://youtu.be/oLnhPCZa_fo - Getting started  
https://youtu.be/1_KdZJfKJVw - Graphic view  
https://youtu.be/HNzobmCYRBo - Help, Information, and Configuration  
https://youtu.be/EqknUXaIRnk - Owner Reference links  
https://youtu.be/10lPGzn0VCk - Schematics (viewing deployed workloads)  
https://youtu.be/zqzGLhoS1VY - Security view  
https://youtu.be/7sjFh8N6FrY - Snapshots (creating and using)  
https://youtu.be/zgJlWk5QqBM - Storage view  
https://youtu.be/_YY3190mlkw - Table view  
https://youtu.be/nwm5IFHbR34 - User interface basics  

<br><br>

## Maintainer

Dave Weilert

https://github.com/k8debug/vpk 


## License

Copyright 2018-2020 David A. Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall beincluded in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
