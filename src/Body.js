import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Sidepane from './Sidepane';
import ContentStyles from './content_templates';

function Body() {
    const canvasRef = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const bodyStyle = { 
        position: 'absolute', 
        top: '0', 
        left: '0', 
        width: '100%', 
        height: '100%',
    };

    const sidepaneContainerStyle = {
        // '@media (min-width: 768px)': {
        position: 'absolute',
        top: '0',
        right: '0',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        // backgroundColor: 'white',
        opacity: 0.9,
        zIndex: 1000,
        color: 'black',

        // }
    }

    // Fetch children of a node
    const fetchChildren = async (id, clickCount) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/children/${id}?page=${clickCount - 1}`);
            if (response.status !== 200) {
                console.log("Error fetching children:", response.statusText);
                return;
            }
            const data = await response.json();
            const transformedData = data.map(d => d.node);
            if (transformedData.length > 0) {
                setNodes(prevNodes => [...prevNodes, ...transformedData]);
            }
            return data;
        } catch (error) {
            console.error('Error fetching children:', error);
            return [];
        }
    };

    // Fetch starting node on page load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const node = new URLSearchParams(window.location.search).get('node') || 'data';
                const response = await fetch(`${process.env.REACT_APP_API_URL}/node/${node}`);
                if (response.status !== 200) {
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

    useEffect(() => {
        const svg = d3.select(canvasRef.current);
        if (nodes.length === 0) {
            svg.style('background-color', 'black');
            // Create a group for the zoomable content
            const g = svg.append("g");

            // Add zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([0.1, 4])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                });

            svg.call(zoom);
            return;
        };
        const stratifiedData = d3.stratify().id(d => d.id).parentId(d => d.parentId)(nodes);
        const root = d3.hierarchy(stratifiedData);
        const g = svg.select("g");

        const simulation = d3.forceSimulation(root.descendants())
            .force("link", d3.forceLink(root.links()).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-50))
            .alphaDecay(0.001)
            .force("collision", d3.forceCollide(d => 20))
            .force("center", d3.forceCenter(svg.node().getBoundingClientRect().width / 2, svg.node().getBoundingClientRect().height / 2));
        

        const link = g
            .selectAll("line")
            .data(root.links())
            .join("line")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6);

        const node = g.selectAll("g")
            .data(root.descendants())
            .join("g");

        // Add image to node
        node.append("image")
            .attr("href", d => {
                return `https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${d.data.data.labels[0].toLowerCase()}.png`
            })
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", "circle(40px at center)")
            .attr("cursor", "pointer");
        
        const text = node.append("text")
            .attr("class", "node-title")
            .text(d => d.data.data.title)
            .attr("x", 40)
            .attr("y", 40)
            .attr("fill", "white");
            
        

        // Click event listeners for nodes
        node
            .on("click", function (event, d) {
                const node = d3.select(this);
                node.attr("expanded", true);
                node.attr("clickCount", parseInt(node.attr("clickCount") || 0) + 1);
                console.log(node.attr("clickCount"));
                setSelectedNode(d.data.data);
                fetchChildren(d.data.id, node.attr("clickCount"));
            })
            .on("dblclick", function (event, d) {
                console.log(d);
                const node = d3.select(this);
                node.attr("expanded", false);
                setSelectedNode(null);
                // Delete all descendants
                const descendants = d.descendants().slice(1); // Exclude the clicked node itself
                setNodes(prevNodes => prevNodes.filter(node => !descendants.some(desc => desc.data.id === node.id)));
            })
            // .on("mouseover", function (event, d) {
            //     svg.append("text")
            //         .attr("class", "node-title")
            //         .text(d.data.data.title)
            //         .attr("x", '2rem')
            //         .attr("y", '2rem')
            //         .attr("fill", "white");
            // })
            // .on("mouseout", function () {
            //     svg.selectAll(".node-title").remove();
            // });

        // Drag event listeners for nodes
        node.call(
            d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

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

        simulation.alpha(1).restart()

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
        <div id="body" style={bodyStyle}>
            <svg ref={canvasRef} width="100%" height="100%"></svg>
            {selectedNode && ContentStyles.get(selectedNode.labels[0].toUpperCase()) && <div style={sidepaneContainerStyle}> 
                <Sidepane selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodes={nodes} />
            </div>}
        </div>
    );
}

export default Body;
