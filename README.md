# VpK - Visual parsed Kubernetes 
<br>

<b>VpK</b> was created as the result of needing a tool to understand what is defined in all those Kubernetes yaml files.

<b>VpK</b> is comprised of a server and browser features.  The server portion is a node.js application that reads and parses Kubernetes definition 'yaml' files.  The browser portion uses javascript and BootStrap.  Communication between the browser and server use both http and web sockets. 


![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/architecture3.png)


Application features include:

- Read and parse definition files from a directory.  Includes processing all sub-directories.  The application does <b>not</b> update or modify any of the definition files.
 
- Upload files and or directories along with compressed files, i.e. zip, gz, tar.

- Access a running instance of IBM Cloud Private and create configuration files for all deployed assets.

- Search parsed defintion files.

- View single or multiple items returned in the search results.

- Rendering of selected item using SVG (Scalable Vector Graphics)
 
- View server logs from browser interface

	


## Installation

	
	Node.js and npm are required to install and execute this application
	

You cannot install and run this application without first installing node.js and npm.  Once the prerequisites are installed proceed to the next step. 

Download the source files and place in a directory.  The source files are available on github and can be downloaded using the following clone command or retrieved 

git clone http://github.com/daveweilert/vpk.git/ 

Change to the directory where the files were placed. Run the following 
NPM command to install the required Node modules:

	npm install

Once the above has successfully completed the application can be run.  

Test the program installation by entering the following command from the directory where the above command was executed.

<b>

node server.js   
</b> 

### Update software

There is no automated process to update an existing version of this software.   A complete new install is required.  Follow the above <b>'Installation'</b> instructions to install a new version of the software.

<br><br>

## Start parameters

VpK has two optional start parameters, directory and port. Examples of there usage are shown below:  

Example using port other than the default:

<b>
node server.js  -p 3000   
</b> 

Example defining directory to parse at program start:

<b>
node server.js  -d /home/dave/cluster   <fully defined directory / path>
</b> 


Example defining directory and port:

<b>
node server.js  -d /data/components -p 8000
</b> 

<br><br>

After starting the server a message will be shown indicating the port to be used when opening the browser.  

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/splash2.png)

Open a browser using the defined port:

<b>
http://localhost:4200 
</b> 

<br><br>

## Usage


### Home screen:


![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/home2.png)

This screen is the interface to search and view the parsed Kubernetes definition files.  The screen is comprised of the following sections:

| Section  | Description |
| :-------: | ---- | 
| Header    | navigation button on the left to access documentation, logs, and configure directory 
| Search    | define the search filters and search value
| Results   | table with the returned search results
| Display   | visual representation of the selected search result item or items 
| Input Directory | displays the selected directory that is processed for files 

<br>

## Navigation menu

Press the navigation button (three horizontal bars) located on the left side of the header.  Once pressed the following slideout menu will appear.  Select one of the menu options or
press the 'X' in the upper right corner to close the menu.

Navigation menu:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/slideoutMenu4.png)

<br>

### About

The About otpion will dispaly information regarding VpK as seen below:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/about4.png)

<br>

----


### Documentation

Documentation entries, Installation and Usage link to the github page showing the appropriate section.  


#### Installation

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/installation.png)

#### Usage

Example screen not shown.  The information in this document contains the Usage information.

<br>

----

### Directory

#### Change Directory

The directory to be parsed can be defined as a parameter when starting the server or provided via the browser interface.  Select the menu option Change Directory to define the directory to be parsed.  When selected a modal screen is shown where the name of the directory is entered and validated.

Directory input shown when directory is validated successfuly:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/directoryPass.png)

<br>

If and invalid directory name is provided the following display is shown:


![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/directoryFail.png)

<br>

The results of processing the 'Change Directory' option are also shown on the home page.  The 
bottom portion of the screen shows the currently selected directory.  

Example display when the directory is successfully validated and processed.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/inputDirectory.png)

Example display when the directory is not successfully validated.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/directoryinputFail.png)


#### FileUpload

Files can be uploaded to a user defined directory.  This feature provides the abilty to 
define a new or existing directory that will be the target for the uploaded files.
Once files are uploaded to the directory use the 'Change Directory' option to parse the
newly loaded files.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/uploadDir.png)

<br>
<br>

If trying to create a directory and the proper privledges do not exist a message similar to the following will be displayed.  In this example the application was attempting to create a new directory in the root file system.  

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/uploadDirFail2.png)

If a period is added before the slash to the directory name './Components' it will be created in the current working directory.

<br>

Once the upload target directory has been defined the file upload area is displayed.
Drag files or folders into the target space. 

Files will be immediately uploaded!  There is no checking for file types during the upload process. 

	Compressed file types of .zip, .gz. and .tar are supported. 
	
The above supported compressed files types will be decompressed into the same directory where the file is uploaded.  

If invalid yaml or non-yaml file types are uploaded they will be skipped when the directory is processed.


![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/uploadReady.png)

<br>
<br>

Uploaded files are represented with a grey square that indicates the file size and file name.  If the name is not fully displayed mouse-over the name to view.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/uploadDone.png)

Files uploaded will continue to be shown in the target space.  If you no longer want to view the uploaded files refresh the browser.


<br>

#### Statistics

Processing statistics for the selected directory are view when this menu option is 
selected.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/directoryStats.png)

<br>

----

### Cluster

Allows accessing a running instance of IBM Cloud Private.  Configuration files will be created for all deployed resources.  These files are placed in a directory named using the value 'cluster' with a sub-directory using the cluster IP.  

The following table provides the required parameters:

| Parameter | Description | Example
| :-------: | ---- | ---- | 
| Cluster IP | IP address for the master node | 172.52.48.89 |
| Cluster Port | Port number to access the master node | 8443 |
| Cluster Name | Name of the cluster | mycluster.icp |
| Namespace | Namespace to process.  Use all-namespaces to process all. | kube-system |
| User id | User id to access the cluster | admin |
| Password | Password to authenticate the above user |  |

<br>

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/cluster1.png)


<br>

The processing of a IBM Cloud Private instance can take several seconds.  A processing message is displayed to help the user understand.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/cluster4.png)


<br>

Processing will complete with either a message indicating success or failure:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/cluster2.png)

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/cluster3.png)

<br>

----

### Logs

#### View

The logs created on server can be viewed with this menu option.  When selected a modal screen
is displayed with the log entries.  Log messages use the format - 

	date / time :: message

Example:



![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/logFile2.png)

#### Clear

This menu option will clear the server logs.


<br>

----

### Colors

#### Show Palette

This option will display the palette of kinds that will be drawn.  Each entry is shown with the associated background color, hex color code, and the short description if defined.  


![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/palette.png)

To modify the color palette edit the configuration file colors.json. This file is located in the directory where you started VpK. After editing save the file and restart the VpK server and refresh the browser session.

Example colors.json file:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/colorsJson.png)
 
<br>
<br>
<br>


## Searching

Two filter dropdowns are provided to assist in limiting the search results . These are Namespace and Search type. One or both of these filters can be selected when searching.  Namespace is populated the namespaces that were located when the definition files are parsed. Select type is populated with the Kubernetes resource type, resource type sub-parameters or user defined types.  Section labeled 'Pasred types' provides a list of all types that can populate this dropdown.

Select the Namespace dropdown to filter results to a single namespace.

Example Namespace dropdown:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/namespacelist.png)


Select the Search type dropdown to filter results to a single type. The 'Search type' is list of parsed and located Kubernetes resource types, resource sub-parameters, API types, and user defined types.  For a list of all types refer to section 'Parsed types'.   This dropdown list is dynamic and is populated with the types that are located when files are parsed.

Example Search type dropdown:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/kindslist2.png)

If a specific value is entered in the 'Search' input field the results will all be filtered to only include
items that match this search value.  If the Search input field is left blank all items will be returned.

Search results example screen is shown below:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/searchResults.png)

<br>

## Display / Viewing

From the search results a graphical representation of one or more result items can be viewed.   To view a single item press the 'View' button to the left of that result item line.  

Example display of single item:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/displaysingle2.png)

<br>

To view more than one item check the box at the beginning of the result item line.  Once the desired items have been selected press the 'View multiple' button 
located above the results table in the upper right corner. 


![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/selectmultiple.png)


Example display of multiple items:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/displaymultiple2.png)


If multiple items are selected which are in more than one namespace the display will group selected items by namespace.


The visual output is interactive.  Mouse over displayed components shown to view additional information related to that component.  Click on the component to view the actual definition 
file that was used to define the components. 

To assist in viewing the matching value is highlighted with green background.  There may be multiple occurrences of the data in non-related portions of the configuration file.  Portions
of the following screen are blurred to hide the IP address of the resources.

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/def3.png)

<br>
<br>


## Docker container 

The file 'Dockerfile' provided can be used to create a docker container for VpK.  The following docker command will build the container.

	docker build -t vpk:latest .

Example output from the above command:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/dockerbuild2.png)


<br>

The newly created container can be run by using the following command:

	docker run vpk:latest

Example output from the above command:

![HOME](https://github.com/IBM-ICP-CoC/VpK/raw/master/docimages/dockerrun.png)

<br>
<br>

The docker run command can also specify a directory that is located on the host machine.  Use the 'volume' parameter to provide a directory for viewing:

	docker run -v /cluster:/cluster vpk:latest

There may also be a need to use a different port than the default port 4200.  Use the port parameter for this need.  Example to use port 3000:

	docker run -v /cluster:/cluster -p 3000:4200 vpk:latest
	
<br>
<br>

## Parsed types

The following table lists the 'types' that will be parsed from the definition files.  These include Kubernetes resource types, sub-parameters from defined types, and user defined. 

| Type name | Description | Level | Flagged User
| :-------: | ---- | ---- | :----: |
| ApiService | Kubernetes API type | Cluster |
| Args | Kubernetes sub-param | Workload | Y
| CertificateSigningRequest | Kubernetes resource type | Cluster |
| ClusterRoleBinding | Kubernetes resource type | Cluster |
| ClusterRole | Kubernetes resource type | Cluster |
| Command | Kubernetes sub-param | Workload | Y
| ConfigMap | Kubernetes resource type | Config & Storage
| ContainerImage | Kubernetes sub-param | Workload | Y
| ContainerName | Kubernetes sub-param | Workload | Y
| CronJob | Kubernetes resource type | Workload |
| DaemonSet | Kubernetes resource type | Workload | 
| Deployment | Kubernetes resource type | Workload |
| Endpoints | Kubernetes resource type | Discovery & Load Balancing |
| Env | Kubernetes sub-param | Workload | Y
| HorizontalPodAutoscaler | Kubernetes resource type | Metadata |
| Ingress	| Kubernetes resource type | Discovery & Load Balancing |
| InitializerConfiguration | Kubernetes API type | Metadata |
| Job | Kubernetes resource type | Workload |
| Labels | Kubernetes sub-param | Multiple |
| LimitRange | Kubernetes resource type | Metadata |
| List | User defined type | User | Y
| LivenessProbe | Kubernetes sub-param | Workload | Y
| Namespace  | Kubernetes resource type | Cluster |
| NetworkPolicy| Kubernetes resource type | Cluster |
| Node | Kubernetes resource type | Cluster |
| NodeSelector | Kubernetes sub-param | Workload | Y
| PersistentVolumeClaim	| Kubernetes resource type | Config & Storage |
| PersistentVolume | Kubernetes resource type | Config & Storage |
| Pod | Kubernetes resource type | Workload |
| PodDisruptionBudget | Kubernetes resource type | Metadata |
| PodPreset | Kubernetes resource type | Metadata | 
| PodSecurityPolicy	| Kubernetes resource type | Metadata |
| PriorityClass | Kubernetes API type | Metadata |
| ReadinessProbe | Kubernetes sub-param | Workload | Y
| ReplicaSet | Kubernetes resource type | Workload |
| ReplicationController | Kubernetes resource type | Workload | 
| ResourceQuota | Kubernetes resource type | Cluster |
| Role | Kubernetes resource type | Cluster | 
| RoleBinding | Kubernetes resource type | Cluster |
| Secret  | Kubernetes resource type | Config & Storage |
| SecretUse  | Kubernetes resource type | Config & Storage | Y
| Service | Kubernetes resource type | Discovery & Load Balancing |
| ServiceAccount | Kubernetes resource type | Cluster |
| StatefulSet | Kubernetes resource type | Workload |
| StorageClass | Kubernetes resource type | Config & Storage |
| TokenReview | Kubernetes API type | Cluster |
| Volume | Kubernetes API type | Cluster
| VolumeAttachment | Kubernetes API type | Config & Storage |
| VolumeClaimTemplate | Kubernetes sub-param | Workload | Y
| VolumeMount | Kubernetes sub-param | Workload | Y




## Maintainer

Dave Weilert

https://github.com/IBM-ICP-CoC/VpK 


## License

Copyright 2018 Dave Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall beincluded in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
