// Build tree chart
const chartTree = (input) => {

    const render = (data) => {
        const nodeSize = 14;
        const width = 950;
        let i = 0;
        const root = d3.hierarchy(data)
            .eachBefore(d => d.index = i++);

        const nodes = root.descendants();
      
        const svg = d3.select('svg')
            .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, (nodes.length + 1) * nodeSize])
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .style("overflow", "visible");
      
        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#999")
          .selectAll("path")
          .data(root.links())
          .join("path")
            .attr("d", d => `
              M${d.source.depth * nodeSize},${d.source.index * nodeSize}
              V${d.target.index * nodeSize}
              h${nodeSize}
            `);
      
        const node = svg.append("g")
          .selectAll("g")
          .data(nodes)
          .join("g")
            .attr("transform", d => `translate(0,${d.index * nodeSize})`);
      
        node.append("circle")
            .attr("cx", d => d.depth * nodeSize)
            .attr("r", 2.5)
            .attr("fill", d => d.children ? "#222" : "#f00");
      
        node.append("text")
            .attr("dy", "0.32em")
            .attr("x", d => d.depth * nodeSize + 6)
            .text(d => d.data.name);
      
        node.append("title")
            .text(d => d.ancestors().reverse().map(d => d.data.name).join("/"));
      
        return svg.node();
    }

    // input is a json data structure
    render(input);

}
