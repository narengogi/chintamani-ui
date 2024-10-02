import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Sidepane from './Sidepane';

function Body() {
    const canvasRef = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const sidepaneContainerStyle = {
        // '@media (min-width: 768px)': {
            position: 'absolute',
            top: '0',
            right: '0',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            opacity: 0.9,
            zIndex: 1000,
            color: 'black',
        // }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/naren`);
                if (!response.ok) {
                    console.log("Error fetching nodes:", response.statusText);
                    return;
                }
                const data = await response.json();
                setNodes([data.node]);
            } catch (error) {
                console.error('Error fetching nodes:', error);
            }
        };
        if (nodes.length === 0) fetchData();
    }, []);

    const fetchChildren = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/children/${id}`);
            if (!response.ok) {
                console.log("Error fetching children:", response.statusText);
                return;
            }
            const data = await response.json();
            const transformedData = data.map(d => d.node);
            setNodes(prevNodes => [...prevNodes, ...transformedData]);
            return data;
        } catch (error) {
            console.error('Error fetching children:', error);
            return [];
        }
    };
    useEffect(() => {
        if (nodes.length === 0) return;
        const stratifiedData = d3.stratify().id(d => d.id).parentId(d => d.parentId)(nodes);
        const root = d3.hierarchy(stratifiedData);
        const svg = d3.select(canvasRef.current);
        svg.style('background-color', 'black');

        // Clear existing content
        svg.selectAll("*").remove();

        // Create a group for the zoomable content
        const g = svg.append("g");

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        const simulation = d3.forceSimulation(root.descendants())
            .force("link", d3.forceLink(root.links()).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .alphaDecay(0.01)
            .force("center", d3.forceCenter(svg.node().getBoundingClientRect().width / 2, svg.node().getBoundingClientRect().height / 2));

        const link = g
            .selectAll("line")
            .data(root.links())
            .join("line")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6);

        const node = g
            .selectAll("g")
            .data(root.descendants())
            .join("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("image")
            .attr("href", d => {
                return `https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${d.data.data.labels[0].toLowerCase()}.png`
            })
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", "circle(40px at center)")
            .attr("cursor", "pointer")
            .on("click", function (event, d) {
                const node = d3.select(this);
                if (node.attr("expanded") === "true") {
                    node.attr("expanded", false);
                    setSelectedNode(null);
                    // Delete all descendants
                    const descendants = d.descendants().slice(1); // Exclude the clicked node itself
                    setNodes(prevNodes => prevNodes.filter(node => !descendants.some(desc => desc.data.id === node.id)));
                } else {
                    node.attr("expanded", true);
                    setSelectedNode(d.data.data);
                    fetchChildren(d.data.id);
                }
            })
            .on("mouseover", function(event, d) {
                d3.select(this.parentNode)
                    .append("text")
                    .attr("class", "node-title")
                    .text(d.data.data.title)
                    .attr("x", d.x + 40)
                    .attr("y", d.y - 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "white");
            })
            .on("mouseout", function() {
                d3.select(this.parentNode).select(".node-title").remove();
            });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x + 20)
                .attr("y1", d => d.source.y + 20)
                .attr("x2", d => d.target.x + 20)
                .attr("y2", d => d.target.y + 20);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }, [nodes]);

    return (
        <div id="body" style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'}}>
                <svg ref={canvasRef} width="100%" height="100%"></svg>
            {/* {selectedNode && <div style={sidepaneContainerStyle}> */}
                {/* <Sidepane selectedNode={selectedNode} setSelectedNode={setSelectedNode} /> */}
            {/* </div>} */}
        </div>
    );
}

export default Body;