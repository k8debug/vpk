// Build circle pack chart
const chartCirclePack = (input, ns) => {
    const render = (data, ns) => {
        
        let leafCnt = 0;
        let clipCnt = 0;
        let eCount = 0;

        const width = 975;
        const height = width;

        const pack = data => {
            const tmp = d3.pack()
                .size([width, height])
                .padding(5)
                (d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value));
            $("#chartInfo").empty();
            $("#chartInfo").html('<span class="vpkfont-md pl-3">View additional informaiton by placing cursor over circles and pausing<span>');        
            return tmp;
        }

        const root = pack(data);

        const svg = d3.select('svg')
            .attr("viewBox", [0, 0, width, height])
            .style("font", "10px sans-serif")
            .style("overflow", "visible")
            .attr("text-anchor", "middle");

        const node = svg.append("g")
            .attr("pointer-events", "all")
            .selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node.append("circle")
            .attr("r", d => d.r)
            .attr("stroke", d => d.children ? "#222" : "none")
            .attr("stroke-width", 0.3)
            .attr("fill", d => {
                let rtn;
                rtn = d.children ? "none" : "rgba(140, 81, 10, 0.8)";
                if (typeof ns !== 'undefined' && ns.length > 0) {
                    if (d.parent !== null ) {
                        if (typeof d.parent.data !== 'undefined') {
                            const cv = ':' + d.parent.data.name + ':';
                            if (ns.indexOf(cv) > -1) {
                                rtn = 'rgba(199, 234, 229, 0.9)';
                            }
                        } 
                    } 
                }
                return rtn;                
            })
            .attr("cid", d => {
                let cid = eCount++;
                let text = d.ancestors().map(d => d.data.name).reverse().join('::')
                return 'cid' + cid + '$' + text;
            })
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);
            
            
            

        const leaf = node.filter(d => !d.children);

        leaf.select("circle")
            .attr("id", d => (d.leafUid = "leaf" + leafCnt++ ));


        leaf.select("circle")
            .attr("id", d => (d.leafUid = "leaf" + leafCnt++ ))
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);


        leaf.append("clipPath")
            .attr("id", d => d.clipUid = "clip" + clipCnt++);

        leaf.append("text")
            .attr("clip-path", d => d.clipUid)
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`);

        // node.append("title")
        //     .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")} Cnt: ${d.value.toLocaleString()}`);

        return svg.node();
    }
    

    // input is a json data structure
    render(input, ns);

}

var lastMove;
var elapsed;

function handleMouseOver(d, i) {            
    // elapsed = Date.now() - lastMove;
    if ( elapsed < 200 ) { 
        return;
    }

    let cid;
    if (typeof this.attributes['cid'] !== 'undefined') {
        cid = this.attributes['cid'].nodeValue;
        //console.log('cid: ' + cid + ' @ x;' + d.x + ' y:' + d.y)
        cid = cid.split('$');
        let text = cid[1];
        text = text.split('::');
        let tip = '<div class="vpkfont-md">';
        let i = 0;
        if (text.length > 2) {
            for (i = 1; i < text.length; i++) {
                let v1 = '';
                if (text[i] === 'Namespaces') {
                    v1 = 'Namespace</b>';
                } else {
                    v1 = text[i];
                }
                tip = tip + '<b>' + v1 + '</b>';
                i++;
                if (typeof text[i] !== 'undefined') {
                    tip = tip + ': ' + text[i] + '<br>';
                } else {
                    if (tip.indexOf('VolumeMounts') === -1) {
                        tip = tip + '(s)';
                    } else {
                        tip = tip;
                    }
                }
            }

            // horizontal scrolling amount
            // let xOff = window.pageXOffset;
            // vertical scrolling amount
            let yOff = window.pageYOffset  
            let yPos = d.clientY + yOff ;
            yPos = yPos - (i * 10);
            yPos = yPos - 40;

            tip = tip + '</div>';
            tooltip.innerHTML = tip;
            tooltip.style.display = "block";
            tooltip.style.left = d.clientX - 100 + 'px';
            tooltip.style.top = yPos + 'px';
        }
    }
    
    lastMove = Date.now();

}
function handleMouseOut(d, i) {
    hideTooltip();
}

function handleClick(d, i) {

    console.log('CLICKED : ' + d.name);
}
// onmousemove="showTooltip(evt, \'' 
// 		+ buildSvgInfo(data.PersistentVolumeClaim, fnum, 'PersistentVolumeClaim') 
// 		+ '\');" onmouseout="hideTooltip()" onclick="getDef2(\'PVC@' +  fnum +'\')"/>'