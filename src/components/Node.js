import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Node = ({ data }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (nodeRef.current) {
      const svg = d3.select(nodeRef.current);

      // Clear any existing content
      svg.selectAll("*").remove();

      // Create a group for the node
      const node = svg.append("g")
        .attr("class", "node");

      // Add a circle for the node
      node.append("circle")
        .attr("r", 30)
        .style("fill", "#69b3a2");

      // Add text to the node
      node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(data.name || "Node");
    }
  }, [data]);

  return <svg ref={nodeRef} width={60} height={60}></svg>;
};

export default Node;
