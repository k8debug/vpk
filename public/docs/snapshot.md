<topicKey snapshot/>
<topicBack id="topicNext" link="tableview"/>
<topicNext id="topicBack" link="overview"/>

<a style="float: right;" href="javascript:docNextTopic()">&nbsp;&nbsp;Next&nbsp;<i class="fas fa-lg fa-arrow-right"></i></a>
<a style="float: right;" href="javascript:docNextTopic('toc')">&nbsp;&nbsp;TOC&nbsp;&nbsp;</a>
<a style="float: right;" href="javascript:docPrevTopic()"><i class="fas fa-lg fa-arrow-left"></i>&nbsp;Prev&nbsp;&nbsp;</a>

###### Snapshot
---

Viewing any infomation within VpK requires the user to connect to a snapshot of K8 information.  This should be the first task any time the application is started.  Using the dropdown with the _"Select snapshot"_ value shown select the desired option.  

<br>

<img style="float: center;" src="docs/docimages/dataSourceDropDown.png" width="180" height="112">

<br><br>

First time usage of VpK will have no existing snapshots.  The __Running cluster__ option must be selected to create a snapahot. Once selected the user must choose how to connect to connect to the running K8 instance.  It is __strongly__ recommended to use an existing kubectl connection.  The user must connect to the cluster outside of the VpK application.  Once the connection is established the snapshot can be created.  Choose the __Existing kubectl connection__ option.    

<br>

<img style="float: center;" src="docs/docimages/clusterTypeDataSource.png" width="700" height="237">

<br><br>

Once the connection is established the snapshot can be created by pressing the __Connect__ button.  

<br>

<img style="float: center;" src="docs/docimages/snapshotClusterInfo.png" width="700" height="320">

<br><br>


A series of processing messages will be displayed.  Once the last   When the snapshot is created a directory will be used to store the information.  The base location for all snapshots is a directory named _cluster_ within the same location where the software is installed.  A new snapshot directory within the 'cluster' directroy is created for each new snapshot.  The new snapshot directory will use the snapshot_prefix value with a date and time appended.  Close the modal dialog by pressing the __Close__ button.

<br>

<img style="float: center;" src="docs/docimages/snapshotDone.png" width="700" height="320">

<br><br>

__Example snapshot directory name:__ kube-2020-11-27-14h-16m-46s

<br><br>


When returned to the home screen the newly connect snapshot is shown in the top portion of the screen.  The complete directory path is shown.  The displayed path can be selected or clicked to view statistics regarding the snapshot.

<br>

<img style="float: center;" src="docs/docimages/snapshotName.png" width="500" height="54">

<br><br>

Statistics are provided with a count for each resource kind within the cluster or count of resource kind within a namespace.

<br>

<img style="float: center;" src="docs/docimages/snapshotStatsKind.png" width="700" height="182">

<br>

<img style="float: center;" src="docs/docimages/snapshotStatsNS.png" width="700" height="268">

<br><br>


---

```
                                    No video available at this time
```
---

<a style="float: right;" href="javascript:docNextTopic()">&nbsp;&nbsp;Next&nbsp;<i class="fas fa-lg fa-arrow-right"></i></a>
<a style="float: right;" href="javascript:docNextTopic('toc')">&nbsp;&nbsp;TOC&nbsp;&nbsp;</a>
<a style="float: right;" href="javascript:docPrevTopic()"><i class="fas fa-lg fa-arrow-left"></i>&nbsp;Prev&nbsp;&nbsp;</a>
