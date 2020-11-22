/*
Copyright 2018 Dave Weilert

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

*/
//------------------------------------------------------------------------------
// Software version
//------------------------------------------------------------------------------
var softwareVersion = '3.1.0';

//------------------------------------------------------------------------------
// Require statements
//------------------------------------------------------------------------------
var vpk = require('./lib/vpk');
var utl = require('./lib/utl');
var vpkReset = require('./lib/vpkReset');
var fileio = require('./lib/fileio');
var search = require('./lib/search');
var gensvg = require('./lib/svgGenDrv');
var kube = require('./lib/kube');
var hier = require('./lib/hierarchy');
var schematic = require('./lib/svgSchematic');

var fs = require('fs-extra');
var Q = require('q');
var bodyParser = require('body-parser');
var YAML = require('js-yaml');
var commandLineArgs = require('command-line-args');
var commandLineUsage = require('command-line-usage');
var chalk = require('chalk');
var multer = require('multer');

var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var socketio = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketio(server);

var expressLayouts = require('express-ejs-layouts');
var partials = require('express-partials');

var compression = require('compression');
var cors = require('cors');


//------------------------------------------------------------------------------
// Define express routes / urls
//------------------------------------------------------------------------------
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(compression());
app.use(cors());

// EJS
//app.use(expressLayouts);

// Partials 
app.use(partials());

// Express 
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', require('./public/routes/index.js'));

// Views location and processing engine
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');



//------------------------------------------------------------------------------
// Application variables
//------------------------------------------------------------------------------
var colors = '';
var dest = './uploads'
var zips = [];
var targz = [];

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, dest)
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
        var ext = path.extname(file.originalname).toUpperCase();
        if (ext === '.ZIP') {
            zips.push(file.originalname);
        }
        if (ext === '.GZ') {
            targz.push(file.originalname);
        }
        if (ext === '.TAR') {
            targz.push(file.originalname);
        }
    }
});

var resetReq = false;
var statMessages;
var dashline = '----------------------------------------------';
var validDir = true;
var port = 4200;
var options;
var optionDefinitions = [{
        name: 'directory',
        alias: 'd',
        type: String
    },
    {
        name: 'port',
        alias: 'p',
        type: Number,
        defaultOption: 4200
    },
    {
        name: 'help',
        alias: 'h'
    }
];

var bb = chalk.green;
var VPK_TITLE = chalk.bold.underline('Visual parsed Kubernetes' );
var VPK_VERSION = chalk.bold.underline('Version: ' + softwareVersion );

// Do not change the spacing of the following VPK_HEADER, and 
// do not delete the single tick mark
var VPK_HEADER = `
${bb('-----------------------------------------------------------------')}
 ${''}              
  ${bb('\\˜˜\\')}        ${bb('/˜˜/')}        ${bb('|˜˜|  /˜˜/')}   ${bb(VPK_TITLE)}
   ${bb('\\  \\')}      ${bb('/  /')}         ${bb('|  | /  /')}    ${bb(VPK_VERSION)}                  
    ${bb('\\  \\')}    ${bb('/  /')}          ${bb('|  |/  /')} 
     ${bb('\\  \\')}  ${bb('/  /')}           ${bb('|      \\')}
      ${bb('\\  \\')}${bb('/  /')}   ${bb('||˜˜˜\\\\')}  ${bb('|  |˜\\  \\')}
       ${bb('\\')}${bb('    /')}    ${bb('||   ||')}  ${bb('|  |  \\  \\')} 
        ${bb('\\')}${bb('__/')}     ${bb('||___//')}  ${bb('|__|   \\__\\')}
                 ${bb('||')}
                 ${bb('||')}
${bb('-----------------------------------------------------------------')}              
  `
//Do not delete the single tick mark above

// reset all vars that are used for parsing
vpkReset.resetAll();

//------------------------------------------------------------------------------
// process start parameters if provided
//------------------------------------------------------------------------------
options = commandLineArgs(optionDefinitions)

// -help used
if (typeof options.help !== 'undefined') {
    help();
    process.exit(0);
}

// -d used
if (typeof options.directory !== 'undefined' && options.directory !== null) {
    var val = options.directory;
    if (fs.existsSync(val)) {
        utl.logMsg('vpkMNL001 - Process directory defined at start: ' + val );
        vpk.dirFS.push(val);
        vpk.startDir = val;
        validDir = true;
    } else {
        utl.logMsg('vpkMNL002 - Not valid directory: ' + val );
        validDir = false;
    }
}

// -p used
if (typeof options.port !== 'undefined' && options.port !== null) {
    port = options.port;
    if (port < 1 || port > 65535) {
        utl.logMsg('vpkMNL099 - Invalid port number defined.  Valid range is 1 - 65535' );
        process.exit(-1);
    }
}

// if not defined create the 'cluster' directory 
makedir('cluster');

// read vpk configuration file
var vf = 'vpkconfig.json';
var gcstatus = utl.readConfig(vf);
if (gcstatus === 'OK') {
    //console.log(JSON.stringify(vpk.configFile));
} else {
    utl.logMsg('vpkMNL095 - Terminating application unable to find configuration file: ' + vf);
    process.exit(-1);
}

// read vpk relations configuration file
var rf = 'relations.json';
var relstatus = utl.readConfig(rf);
if (relstatus === 'OK') {
    //console.log(JSON.stringify(vpk.configFile));
} else {
    utl.logMsg('vpkMNL095 - Terminating application unable to find configuration file: ' + rf);
    process.exit(-1);
}



//------------------------------------------------------------------------------
// Define express routes / urls
//------------------------------------------------------------------------------

app.get('/hier', function(req, res) {
    let data = vpk.hierarchy;
    res.end(JSON.stringify(data,null,4));
    utl.logMsg('vpkMNL787 - GET hier event received');
});


app.get('/dumpall',function(req,res){
    res.end(JSON.stringify(vpk,null,2));
    utl.logMsg('vpkMNL791 - GET dumpall event received');
});

app.get('/dumpcore',function(req,res){
    let data = vpk;
    res.end(JSON.stringify(data,null,2));
    utl.logMsg('vpkMNL787 - GET dumpcore event received');
});

// dump something from vpk 
app.get('/dump/:what', function(req, res) {
    let data = req.params.what;
    res.end(JSON.stringify(vpk[data],null,2));
    utl.logMsg('vpkMNL787 - GET dump/<what> event received');
});

// dump something from vpk 
app.get('/dumpobj/:p1', function(req, res) {
    let p1 = req.params.p1;
    let obj = vpk[p1];
    let objName = 'vpk.' + p1;
    let result = utl.showProps(obj,objName)
    res.end(result);
    utl.logMsg('vpkMNL792 - GET dumpobj/<name> event received');
});

app.get('/dumpobj/:p1/:p2', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let obj = vpk[p1][p2];
    let objName = 'vpk.' + p1 + '/' + p2;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let obj = vpk[p1][p2][p3];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let obj = vpk[p1][p2][p3][p4];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let obj = vpk[p1][p2][p3][p4][p5];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let obj = vpk[p1][p2][p3][p4][p5][p6];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let p12 = req.params.p12;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11][p12];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11 + '/' + p12;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12/:p13', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let p12 = req.params.p12;
    let p13 = req.params.p13;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11][p12][p13];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11 + '/' + p12 + '/' + p13;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12/:p13/:p14', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let p12 = req.params.p12;
    let p13 = req.params.p13;
    let p14 = req.params.p14;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11][p12][p13][p14];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11 + '/' + p12 + '/' + p13 + '/' + p14;
    let result = utl.showProps(obj,objName)
    res.end(result);
});


app.get('/ping', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    utl.logMsg('vpkMNL788 - Pinged');
    res.end('VPK server is OK\n');
});


app.post('/upload', function(req, res) {

    var upload = multer({
        storage: storage
    }).array('file', 4);

    upload(req, res, function(err) {
        if (err) {
            utl.logMsg('vpkMNL022 - Error processing upload, message: ' + err );
            return res.status(422);
        }

        // untar files
        if (targz.length > 0) {
            for (gz in targz) {
                if (targz[gz] !== null) {
                    utl.logMsg('vpkMNL020 - UnTar file: ' + targz[gz] );
                    utl.untar(targz[gz], dest)
                    targz[gz] = null;
                }
            }
        }

        // unzip files
        if (zips.length > 0) {
            for (zp in zips) {
                if (zips[zp] !== null) {
                    utl.logMsg('vpkMNL021 - UnZip file: ' + zips[zp] );
                    utl.unzip(zips[zp], dest)
                    zips[zp] = null;
                }
            }
        }

        res.end("File(s) processed");
    });
});





function chgP2(data) {
    let cp = data.lastIndexOf('@');
    let result = '';
    if (cp > -1) {
        result = data.substring(0,cp) + '/' + data.substring(cp + 1);
    } else {
        result = data;
    }
    return result;
}

//------------------------------------------------------------------------------
// Define SocketIO 
//------------------------------------------------------------------------------
io.on('connection', client => {

    client.on('clearData', () => {
        utl.logMsg('vpkMNL119 - Clear data request' );
        //console.log(JSON.stringify(vpk, null, 4))
        //console.log('======================================================')
        vpkReset.resetAll();
    });

    client.on('clusterDir', () => {
        utl.logMsg('vpkMNL676 - Get cluster directory request' );
        var result = {
            'dirs': utl.getClusterDir()
        };
        utl.logMsg('vpkMNL021 - Emit cluster directory' );
        client.emit('clusterDirResult', result);

    });

    client.on('dynamic', (data) => {
        utl.logMsg('vpkMNL699 - Dynamic request' );
        var dynDir = process.cwd();
        var tmpDir = data.ip;
        if (typeof data.datasource_prefix !== 'undefined') {
            var dTmp = data.datasource_prefix;
            dTmp.trim();
            var fs = dTmp.indexOf(' ');
            if (fs > -1 ){
                dTmp = dTmp.substring(0,fs);
            }
            tmpDir = dTmp;
        }
        tmpDir = tmpDir + '-' + utl.dirDate();
        var kga;       // Kubernetes Get Array
        var slp = tmpDir.lastIndexOf('/');

        if (slp > -1) {
            slp++;
            tmpDir = tmpDir.substring(slp);
        }
        dynDir = dynDir + '/cluster/' + tmpDir;
        vpk.clusterDirectory = dynDir;
        var ca = kube.getAuth(data);
        if (ca === 'PASS') {
            var msg = 'Authentication completed successfully';
            client.emit('getKStatus', msg);
            // get list of api resources in the cluster
            kga = kube.getAPIs(data);
            if (kga === 'FAIL') {
                var msg = 'Failed to retrieve api resource data, check log messages';
                utl.logMsg('vpkMNL697 - ' + msg );
                client.emit('getKStatus', msg);
                kube.logout(data);
            } else {
                // reset and clear the old kinds and counts in the vpk object
                utl.resetVpkObject();
                getK(data, kga, client, dynDir);
            }
        } else {
            kube.logout(data);
        }
    });

    client.on('getCmds', () => {
        utl.logMsg('vpkMNL019 - Get command history' );
        var result = {
            'logs': vpk.cmdHist
        };
        utl.logMsg('vpkMNL021 - Emit cmdResult' );
        client.emit('cmdResult', result);
    });

    client.on('getColors', () => {
        utl.logMsg('vpkMNL077 - GetColors request' );
        var result = {'colors': vpk.colors};
        utl.logMsg('vpkMNL078 - Emit colorsResults' );
        client.emit('colorsResult', result);
    });

    client.on('decode', parm => {
        // save the key for use when results are returned
        var def = parm.file;
        var secret = parm.secret;
        var parts = def.split('::');
        var fn = parts[0] + '::' + parts[1];
        var rtn;
        var data;
        var tmp;

        utl.logMsg('vpkMNL173 - Decode secret from file: ' + fn );
            
        // decode base64 data in secret
        try {
            tmp = vpk.fileContent[fn];
            tmp = tmp[0].content;
            data = tmp.data;
            console.log(typeof data);
            if (typeof data === 'object') {
                let keys = Object.keys(data);
                let key;
                for (let d = 0; d < keys.length; d++) {
                    key = keys[d];
                    console.log(key + ' :: ');
                    let buff = new Buffer.from(data[key], 'base64');
                    text = buff.toString('ascii');
                    if (text.startsWith('{')) {
                        rtn = JSON.parse(text);
                        break;
                    } else {
                        rtn = text;
                    }
                }
            }
            var result = {
                'value': rtn,
                'secret': secret
            };
            utl.logMsg('vpkMNL005 - Emit decodeDef' );
            client.emit('decodeDef', result);
        } catch (err) {
            utl.logMsg('vpkMNL174 - Error processing decode, message: ' + err );
        }
    });




    client.on('getDef', data => {
        // save the key for use when results are returned
        var parts = data.split('::');
        var defkey = parts[2];
        data = parts[0] + '::' + parts[1];

        utl.logMsg('vpkMNL003 - Get object definition from file: ' + parts[0] + ' part: ' + parts[1] );
        try {
            var rtn = '';
            var part = data.split('::');
            rtn = YAML.safeDump(vpk.fileContent[data]);
            var result = {
                'filePart': part[1],
                'lines': rtn,
                'defkey': defkey
            };
            utl.logMsg('vpkMNL005 - Emit objectDef' );
            client.emit('objectDef', result);
        } catch (err) {
            utl.logMsg('vpkMNL004 - Error processing getDef, message: ' + err );
        }
    });

    client.on('getHierarchy', data => { 
        utl.logMsg('vpkMNL077 - GetHierarchy request' );

        var result = hier.filterHierarchy(data);

        // var result = {'hierarchy': vpk.relMap};
        utl.logMsg('vpkMNL178 - Emit hierarchyResults' );
        client.emit('hierarchyResult', result);
    });    


    client.on('getDirStats', data => {
        utl.logMsg('vpkMNL006 - DirStats request' );
        utl.logMsg('vpkMNL007 - Emit dirStatsResults' );
        var result = {'kind': vpk.fileCnt, 'ns': vpk.namespaceCnt}
        //client.emit('dirStatsResult', statMessages);
        client.emit('dirStatsResult', result);
    });

    client.on('getSelectLists', () => {
        utl.logMsg('vpkMNL008 - Get select lists request' );

        var labels = Object.keys(vpk.labelKeys);

        var result = {
            'kinds': vpk.kinds,
            'namespaces': vpk.definedNamespaces,
            'baseDir': vpk.startDir,
            'validDir': validDir,
            'providers': vpk.providers,
            'labels': labels
        };
        utl.logMsg('vpkMNL047 - Emit selectListsResult' );
        client.emit('selectListsResult', result);
    });

    client.on('getSvg', data => {
        utl.logMsg('vpkMNL997 - Build SVG requests received' );
        var result = gensvg.build(data);
        utl.logMsg('vpkMNL048 - Emit svgResult' );
        client.emit('svgResult', result);
    });

    client.on('getVersion', data => {
        utl.logMsg('vpkMNL091 - Get software version request ' );
        var result = {'version': softwareVersion};
        utl.logMsg('vpkMNL049 - Emit version' );
        client.emit('version', result);
    });

    client.on('reload', data => {
        utl.logMsg('vpkMNL009 - Load directory: ' + data );
        vpk.clusterDirectory = data;
        reload(data);
        setTimeout( () => {
            var result = {
                'kinds': vpk.kinds,
                'namespaces': vpk.definedNamespaces,
                'baseDir': vpk.startDir,
                'validDir': validDir,
                'providers': vpk.providers
            };
            utl.logMsg('vpkMNL010 - Emit selectListsResult, reset completed after 2 second wait' );
            client.emit('selectListsResult', result);

            result = {
                'baseDir': vpk.startDir,
                'validDir': validDir
            };
            utl.logMsg('vpkMNL011 - Emit resetResults' );
            client.emit('resetResults', result);

            resetReq = false;
        }, 2000);
    });

    client.on('saveFile', data => {
        utl.logMsg('vpkMNL076 - SaveFile request for file: ' + data.filename );
        var status = utl.saveEditFile(data.filename, data.content);
        client.emit('saveFileResults', status);
    });


    client.on('schematic', data => {
        utl.logMsg('vpkMNL091 - Get schematic request ' );
        schematic.parse(data);
        client.emit('schematicResult', {'data': vpk.containers, 'messages': vpk.svgMsg} );
    });


    client.on('search', data => {
        var msg = 'Search for ' + data.kindFilter + ' in ' + data.namespaceFilter;
        if (data.kindnameValue > '') {
            msg = msg + ' with name of kind containing: ' + data.searchValue
        }
        if (data.labelFilter > '::') {
            msg = msg + ' and labels: ' + data.labelFilter
        }        
        utl.logMsg('vpkMNL037 - ' + msg);
        var result = search.process(data);
        utl.logMsg('vpkMNL036 - Emit searchResult' );
        client.emit('searchResult', result);
    });


    client.on('uploadDir', data => {
        utl.logMsg('vpkMNL045 - Upload directory request' );
        var result = uploadDir(data);
        utl.logMsg('vpkMNL044 - Emit uploadDir' );
        client.emit('uploadDirResult', result);
    });

});


// Get the K8 resource type and emit message after processing
async function getK(data, kga, client, dynDir) {
    var kind;
    var tmp;
    var msg;
    var hl;
    hl = kga.length;
    var curK = 0;

    // initialize global storage to be empty
    vpk.rtn = {'items': []};
    for (var k = 0; k < kga.length; k++) {
        await kube.getKubeInfo(data, kga[k], client)
        tmp = kga[k];
        kind = tmp.substring(0, tmp.length - 2);
        curK++;
        msg = 'Processed count ' + curK + ' of ' + hl + ' - Resource kind: <span style="color: blue;">' + kind + '</span>';
        client.emit('getKStatus', msg);
    }
    // logout of current K8s environment
    kube.logout(data);
    returnData(client, dynDir);

}

function returnData(client, dynDir) {
    var rdata = {};
    if (vpk.rtn === 'FAIL') {
        rdata.status = 'FAIL';
        rdata.message = 'Failed to retrieve data, check log messages';
    } else {
        rdata = write2(vpk.rtn, dynDir);
    }
    utl.logMsg('vpkMNL697 - Emit dynamicResults' );
    client.emit('dynamicResults', rdata);
}

function write2(yf, dynDir) {
    utl.logMsg('vpkMNL606 - Write files invoked' );
    var rdata  = {};
    rdata.status = 'PASS';
    rdata.message = 'OK';

    try {
        remdir(dynDir);
        var mkresult = makedir(dynDir);
        if (mkresult === 'PASS') {
            var fbase = 'config';
            var fnum = 1000;
            var fn;
            var input;
            var cnt = 0;
            for (var i = 0; i < yf.items.length; i++) {
                input = yf.items[i];
                input = JSON.stringify(input, null, 4);
                fnum++;
                fn = dynDir + '/' + fbase + fnum + '.yaml';
                fs.writeFileSync(fn, input);
                cnt++
                utl.saveFileName(fn, fnum)
            }
            utl.logMsg('vpkMNL603 - Created ' + cnt + ' yaml files' );

            // load newly created files
            reload(dynDir);
            
        } else {
            utl.logMsg('vpkMNL605 - Unable to create directory: ' + dynDir + ' message: ' + err );
            rdata.status = 'FAIL';
            rdata.message = 'vpkMNL605 - Unable to create directory: ' + dynDir + ' message: ' + err;
        }
    } catch (err) {
        utl.logMsg('vpkMNL606 - Error creating directory: ' + dynDir + ' message: ' + err );
        rdata.status = 'FAIL';
        rdata.message = 'vpkMNL606 - Error creating directory: ' + dynDir + ' message: ' + err;
        return rdata;
    }
    return rdata;
}


/**
 * Create the target directory for file uploads.   
 * @param {string} - [dir] Directory name
 * @returns {Object} A JSON object with fields status: (PASS or FAIL), dir: directory, msg: error message if create 
 */
function uploadDir(dir) {
    // clear or reset existing vars	
    zips = [];
    targz = [];

    var currentDir = process.cwd();
    var rtn;
    var status = 'PASS';
    if (dir.startsWith('./')) {
        dir = currentDir + '/' + dir.substring(2)
    }

    // determine if directory already exist and/or create directory
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            rtn = 'Created directory: ' + dir;
        } else {
            rtn = 'Directory: ' + dir + ' already exists';
        }
        // set the file upload directory
        dest = dir;

    } catch (e) {
        rtn = e.message;
        status = 'FAIL';
    }

    // return JSON object with results
    utl.logMsg('vpkMNL019 - ' + rtn );
    var data = {
        'status': status,
        'dir': dir,
        'msg': rtn
    };

    return data;
}


function reload(dir) {

    // if valid directory process
    if (fs.existsSync(dir)) {
        resetReq = true;
        utl.resetVpkObject();
        vpkReset.resetAll();
        vpk.dirFS.push(dir);
        vpk.startDir = dir;
        utl.logMsg('vpkMNL011 - Reset to new directory: ' + vpk.startDir );
        validDir = true;
        checkLoop();
    } else {
        vpk.startDir = dir;
        validDir = false;
        statMessages = [];
        statMessages.push('vpkMNL012 - Invalid directory, no stats returned' );
    }
}


function makedir(dir) {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            utl.logMsg('vpkMNL158 - Created directory: ' + dir );
        } else {
            utl.logMsg('vpkMNL157 - Directory already exists: ' + dir );
        }
        return 'PASS';            
    } catch (e) {
        utl.logMsg('vpkMNL160 - Mkdir failed for directory: ' + dir + ' error message: ' + e );
        return 'FAIL';
    }
}


function remdir(dir) {
    try {
        fs.removeSync(dir);
        utl.logMsg('vpkMNL163 - Removed directory: ' + dir );
        fs.mkdirSync(dir);
        utl.logMsg('vpkMNL164 - Created directory: ' + dir );
    } catch (err) {
        utl.logMsg('vpkMNL155 - Unable to delete resource: ' + dir + ' error message: ' + err );
    }
}



//------------------------------------------------------------------------------
// check if processing should continue
//------------------------------------------------------------------------------
function checkLoop() {
    statMessages = [];

    if (!validDir) {
        startServer();
        return;
    }

    if (vpk.loop) {
        fileio.checkDir();
        checkAgain();
    } else {

        saveStatMsg('dl', ' ');
        saveStatMsg('Dirs read', vpk.dCnt);
        saveStatMsg('Files read', vpk.fCnt);
        saveStatMsg('Kube YAML', vpk.yCnt);
        saveStatMsg('Skipped', vpk.xCnt);
        
        saveStatMsg('dl', ' ');

        //saveStatMsg('Containers', vpk['ContainerCnt']);
        //saveStatMsg('PersistentVolumes', vpk['PersistentVolumeCnt']);
        //saveStatMsg('Services', vpk['ServicesCnt']);

        var totId = vpk.cntId.split('::');
        if (totId.length > 0) {
            totId.sort();
            for (var c = 0; c < totId.length; c++) {
                var cId = totId[c];
                cId = cId.trim();
                if (cId.length > 0) {
                    cId = cId + 'Cnt'
                    var item = vpk[cId]
                    if (typeof item !== 'undefined') {
                        if (typeof item.id !== 'undefined') {
                            saveStatMsg(item.id, item.count);
                        }
                    }
                }
            }
        saveStatMsg('dl', ' ');
        }

        // After reading and parsing of files start server
        if (resetReq) {
            resetReq = false;
        } else {
            startServer();
        }

        //vpkSize();
    }
}


function saveStatMsg(msg, cnt) {
    if (msg === 'dl') {
        utl.logMsg(dashline );
    } else {
        if (cnt === 0) {
            return;
        }
        //           123456789012345678901234567890123456789012345
        msg = msg + '                                        ';
        msg = msg.substring(0,40)

        utl.logMsg(msg + cnt );
        statMessages.push(msg + '::' + cnt);
    }
}

//------------------------------------------------------------------------------
// check if still processing
//------------------------------------------------------------------------------
function checkAgain() {
    checkLoop();
}

function startServer() {
    splash();
    getColors();
    utl.logMsg('vpkMNL014 - VpK Server started, port: ' + port );
    server.listen(port);
    
}

function vpkSize() {
    utl.logMsg('vpkMNL313 - Calculating size of vpk')
    var vsize = utl.sizeof(vpk);
    utl.logMsg('vpkMNL314 - Estimated size of vpk: ' + vsize +' bytes')

}

function help() {
    var usage = commandLineUsage([{
            content: VPK_HEADER,
            raw: true,
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ]);
    console.log(usage);
}

function splash() {
    var adv = commandLineUsage([{
        content: VPK_HEADER,
        raw: true,
    }]);
    console.log(adv);
}


function getColors() {
    utl.getColors()
        .then(function(data) {
			colors = JSON.parse(data)
            utl.logMsg('vpkMNL350 - Loaded colors' );
                            	// populate cldr object with config parms
            try {
                vpk.colors = JSON.parse(data);
                //console.log(JSON.stringify(vpk.colors,null,2));
            } catch (e) {
                utl.logMsg('vpkUTL035 - Colors file: colors.json has invalid format, message: ' + e);
            }
            
        })
        .catch(function(err) {
            utl.logMsg('vpkMNL351 - Failed to load colors ' + err );
            process.exit(-1);
        });
}

//begin processing
checkLoop();