// Build collapsible hierarchy chart
const chartCollapsible = (input) => {    
    const render = data => {

        const width = 1250;
        const dx = 16;
        const dy = width / 9;
        const margin = {top: 10, right: 120, bottom: 10, left: 40};
        
        const diagonal = d3.linkHorizontal()
            .x(d => { return d.y } )
            .y(d => { return d.x } );

        const tree = (root) => {
            return d3.tree().nodeSize([dx, dy])(root);
        }

        const root = d3.hierarchy(data);
        root.x0 = dy / 2;
        root.y0 = 0;
        root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length !== 7) {
            d.children = null;
        } 
        });

        //const svg = d3.select("charts").append("svg")
        const svg = d3.select("svg")
            .attr("viewBox", [-margin.left, -margin.top, width, dx])
            .style("font", "11px sans-serif")
            .style("user-select", "none");

        const gLink = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#755")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.0);
    
        const gNode = svg.append("g")
            .attr("cursor", "pointer")
            .attr("pointer-events", "all");    

        // Process to expand and collapse the tree
        function update(source) {

            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            const nodes = root.descendants().reverse();
            const links = root.links();
        
            // Compute the new tree layout.
            tree(root);
        
            let left = root;
            let right = root;
            root.eachBefore(node => {
                if (node.x < left.x) { 
                    left = node
                };
                if (node.x > right.x) {
                    right = node;
                }
            });
        
            const height = right.x - left.x + margin.top + margin.bottom;

            const transition = svg.transition()
                .duration(duration)
                .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
        
            // Update the nodes…
            const node = gNode.selectAll("g")
                .data(nodes, d => d.id);
        
            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", (event, d) => {
                    d.children = d.children ? null : d._children;
                    update(d);
                });
        
            nodeEnter.append("circle")
                .attr("r", 4)
                .attr("fill", d => d._children ? "#29f" : "#f33")
                .attr("stroke-width", 10);
        
            nodeEnter.append("text")
                .attr("dy", "0.31rem")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(d => d.data.name)
                .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white");
        
            // Transition nodes to their new position.
            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);
        
            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit().transition(transition).remove()
                .attr("transform", d => `translate(${source.y},${source.x})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0);
        
            // Update the links…
            const link = gLink.selectAll("path")
                .data(links, d => d.target.id);

            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append("path")
                .attr("d", d => {
                const o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr("d", d => {
                const o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
                });

            // Stash the old positions for transition.
            root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }
    
        update(root);
        return svg.node();
    }

    // input is a json data structure
    render(input);

}
