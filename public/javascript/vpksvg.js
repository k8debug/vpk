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

//----------------------------------------------------------
// build svg data from returned data
//----------------------------------------------------------
function svgResult(data) {
    //console.log(JSON.stringify(data));
    var sbase = ' ';
    var tmp = ' ';
    var ns;
    var newsvg;
	var kind;
    for (var e = 0; e < data.length; e++) {
		kind = data[e].kind;

    	if (data[e].evt === 'endNamespace') {
    	    // get svg header info and trim 30 pixels from bottom
    	    var ht = data[e].y;
    	    ht = ht - 30;
    		sbase = sbase + writeSVGHeader(1280, ht , ns); 

    		// add the svg info
    		sbase = sbase + tmp;
    		tmp = ' ';
    		// close the svg 
    		sbase = sbase + '</svg>';
    	}

    	if (data[e].evt === 'startNamespace') {
    		// save the namespace
    		ns = data[e].ns; 
    	}

    	if (data[e].evt === 'circle') {
    		// draw circle, using h variable for radius
    		newsvg = writeCircle(data[e].x, data[e].y, data[e].h); 
    		tmp = tmp + newsvg;    	
    	}

    	if (data[e].evt === 'text') {
    		// draw circle, using h variable for radius
    		newsvg = writeText(data[e].x, data[e].y, data[e].name); 
    		tmp = tmp + newsvg;
    	}

    	if (data[e].evt === 'entry') {
			// draw rectangle
    		newsvg = writeBox(data[e].x, data[e].y, data[e].h, data[e].w, data[e].kind, data[e].src, data[e].part, data[e].name ) 
    		tmp = tmp + newsvg;
    	}

    	if (data[e].evt === 'boundary') {
			// draw dashed boundary box
    		newsvg = writeBoundary(data[e].x, data[e].y, data[e].h, data[e].w, data[e].kind, data[e].src, data[e].part, data[e].name ) 
    		tmp = tmp + newsvg;
    	}

    	if (data[e].evt === 'line') {
    		// draw line
    		newsvg = writeLine(data[e].x, data[e].y, data[e].h, data[e].w) 
    		tmp = tmp + newsvg;
    	}

    }
    $("#svgResults").empty();
    $("#svgResults").html('');
    
    //console.log(sbase);

	$("#svgResults").html(sbase);
    $("#svgResults").show();
}


function writeSVGHeader(w, h, ns) {
    var hdr1 =  '<svg xmlns="http://www.w3.org/2000/svg" width="';
    var hdr2 = '" height="';
    var hdr3 = '"><g><title>';
	var hdr4 = '</title><rect fill="#ccc" id="canvas_background" height="'
	var hdr4b = '" width="1080" y="-1" x="-1"/>' 
	var hdr5 = '<text x="5.0"  y="15.0"  xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="14" ' +
                      'fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000">' 
    var hdr6 = '</text><g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">' +
               '<rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/></g></g>';

	h = h + 30;
	if (ns === 'CLUSTER') {
		ns = 'none - cluster level definition';
	}
	return hdr1 + w + hdr2 + h + hdr3 + 'NAMESPACE: ' + ns + hdr4 + h + hdr4b +hdr5 + 'NAMESPACE: ' + ns + hdr6;
}

function writeText(x, y, text) {

	if (text.length > 54 ) {
		console.log('Truncate: ' + text)
		text = text.substring(0,48)+' . . .'
		console.log('New value: ' + text)
	}

	var txt1 = '<text x="';
	var txt2 = '"  y="';
	var txt3 = '"  xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="12" ' +
                      'fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000">' 
    var txt4 = '</text>';

	return txt1 + x + txt2 + y + txt3 + text + txt4; 
}

function writeLine(x1, y1, x2, y2) {
	var line1 = '<line stroke-linecap="square" stroke-linejoin="miter" x1="'; 
	var line2 = '"  y1="';
	var line3 = '"  x2="';
	var line4 = '"  y2="';
	var line5 = '"  stroke-width="1.0" stroke="#000" fill="none"/>';
	
	return line1 + x1 + line2 + y1 + line3 + x2 + line4 + y2 + line5;
}

function writeCircle(x, y, r) {
	var cir1 = '<circle  onmousemove="showTooltip(evt, \'This is blue\');" onmouseout="hideTooltip();"  cx="';
	var cir2 = '" cy="';
	var cir3 = '" r="';
	var cir4 = '" style="fill: #fff; stroke: #fff; stroke-width: 0.5px;" />';
	
	return cir1 + x + cir2 + y + cir3 + r + cir4;
}

function writeBox(x, y, h, w, kind, src, part, objname) {
	svgE++;	
	var sq = "'";
	var color;
	var name;
    var text;
	var data = setData(kind); 

	color = data[0];
	text = data[1];
	if (data[2] !== "") {
		name = data[2];
	} else {
		name = kind;
	}

	if (data[3] === 'Unknown') {
		w = 250;
	}

    var ent1 = '<g><g id="svge';
    var ent2 = '" onclick="getDef(';
    var ent3 = ')"><title>';         // source file name  
    var ent4 = '</title><rect  onmousemove="showTooltip(evt, \'This is blue\');" onmouseout="hideTooltip();" x="';        // x cord
    var ent5 = '"  y="';                   // y cord
    var ent6 = '"  height="';              // heigth
    var ent7 = '" width="';                // width
    var ent8 = '" fill="#';                //color
    var ent9 = '" stroke="#000000" stroke-width="0.5"  rx="6" ry="6" /><text x="'  // border 
	var ent10 = '"  y="'  // border continued
	var ent11 = '"  xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="12" ' +
                      'fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#' + text + '" fill="#' + text + '">';
	var ent12 = '</text></g></g>';

	var tx = x + 3;
	var ty = y + 20;

	return ent1 + svgE + ent2 + sq + src + '::' + part + '::' + objname + sq + ent3 + objname + ent4 + x + ent5 + y + ent6 + h + ent7 + w + ent8 + color + ent9 + tx + ent10 + ty + ent11 + name + ent12;

}

function writeBoundary(x, y, h, w, kind, src, part, objname) {
    var ent1 = '<g><rect x="';        // x cord
    var ent2 = '"  y="';                   // y cord
    var ent3 = '"  height="';              // heigth
    var ent4 = '" width="';                // width
    var ent5 = '" fill=none stroke="#000000" stroke-width="0.5" stroke-dasharray="3, 3" rx="6" ry="6" /></g>';

	return ent1 + x + ent2 + y + ent3 + h + ent4 + w + ent5;

}

// colors for background and text are defined in the colors.json file that is read
// by the server and pasted to browser.  Update that file to change the colors for
// a specific kind.
function setData(type) {
	var data = [];
	if (typeof colors.colors[type] === 'undefined') {
		console.log('Undefined kind: ' + type);
    	data.push(colors.colors['default'][0].backgroundColor);
    	data.push(colors.colors['default'][0].textColor);
    	data.push(type);
		data.push('Unknown');
	} else {
    	data.push(colors.colors[type][0].backgroundColor);
    	data.push(colors.colors[type][0].textColor);
    	data.push(colors.colors[type][0].title);
		data.push('OK');
	}
	return data;	
}


//----------------------------------------------------------
console.log('loaded vpksvg.js');