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

/*----------------------------------------------------------
Startup splash 
*/

'use strict';

var commandLineUsage = require('command-line-usage');
var commandLineUsage = require('command-line-usage');
var chalk = require('chalk');

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');


module.exports = {

//------------------------------------------------------------------------------
// exported functions  
//------------------------------------------------------------------------------

    help: function() {
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
    },

    pop: function(softwareVersion, port) {

        var bb = chalk.green;
        var VPK_TITLE = chalk.bold.underline('Visual parsed Kubernetes' );
        var VPK_VERSION = chalk.bold('Version: ' + softwareVersion );
        var VPK_PORT = chalk.bold('Server Port: ' + port)
        
        // Do not change the spacing of the following VPK_HEADER, and 
        // do not delete the single tick mark
        var VPK_HEADER = `
          ${bb('------------------------------------------------------------------')}
          | ${''}                                                               |              
          |  ${bb('\\˜˜\\')}        ${bb('/˜˜/')}        ${bb('|˜˜|  /˜˜/')}   ${bb(VPK_TITLE)} |
          |   ${bb('\\  \\')}      ${bb('/  /')}         ${bb('|  | /  /')}    ${bb(VPK_VERSION)}           |                  
          |    ${bb('\\  \\')}    ${bb('/  /')}          ${bb('|  |/  /')}     ${bb(VPK_PORT)}        | 
          |     ${bb('\\  \\')}  ${bb('/  /')}           ${bb('|      \\')}                              |
          |      ${bb('\\  \\')}${bb('/  /')}   ${bb('||˜˜˜\\\\')}  ${bb('|  |˜\\  \\')}                             |
          |       ${bb('\\')}${bb('    /')}    ${bb('||   ||')}  ${bb('|  |  \\  \\')}                            | 
          |        ${bb('\\')}${bb('__/')}     ${bb('||___//')}  ${bb('|__|   \\__\\')}                           |
          |                 ${bb('||')}                                             |
          |                 ${bb('||')}                                             |
          ${bb('------------------------------------------------------------------')}              
          `
        //Do not delete the single tick mark above


        var adv = commandLineUsage([{
            content: VPK_HEADER,
            raw: true,
        }]);
        console.log(adv);
    }
}