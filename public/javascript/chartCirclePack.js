// Build circle pack chart
const chartCirclePack = (input, ns) => {
    const render = (data, ns) => {
        ns = ':default:openshift:';
        let leafCnt = 0;
        let clipCnt = 0;

        const width = 975;
        const height = width;

        const pack = data => {
            const tmp = d3.pack()
                .size([width, height])
                .padding(5)
                (d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value));
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
            });

        const leaf = node.filter(d => !d.children);

        leaf.select("circle")
            .attr("id", d => (d.leafUid = "leaf" + leafCnt++ ));

        leaf.append("clipPath")
            .attr("id", d => d.clipUid = "clip" + clipCnt++);

        leaf.append("text")
            .attr("clip-path", d => d.clipUid)
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`);

        node.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")} Cnt: ${d.value.toLocaleString()}`);

        return svg.node();
    }
    

    // input is a json data structure
    render(input, ns);

}