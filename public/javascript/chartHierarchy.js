// Build collapsible hierarchy chart
const chartHierarchy = (input) => {

    let width = 1250;
    let height = 500;
    const svg = d3.select('svg');

    const tree = data => {
        const root = d3.hierarchy(data);
        root.dx = 16;
        root.dy = width / (root.height + 1);
        $("#chartInfo").empty();
        $("#chartInfo").html('<span class="vpkfont-md pl-3">Expanded hierarchy</span>');
        return d3.tree().nodeSize([root.dx, root.dy])(root);
    
    }

    const render = data => { 
        const root = tree(data);

        let x0 = Infinity;
        let x1 = -x0;
        root.each(d => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
        });

        // calculate height of svg region and set the attribute
        height = +x1 - x0 + root.dx * 2;
        height = height + 100;
        svg
            .attr('height', height)
            .attr('width', width)

        const g = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

        const link = g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#755")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 0.5)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        const node = g.append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle")
            .attr("fill", d => d.children ? "#29f" : "#f33")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -6 : 6)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");

        return svg.node();
    };

    // input is a json data structure
    render(input);

}
