import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Sidepane from './Sidepane';

function Body() {
    const canvasRef = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

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
            console.log(data)
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

        const simulation = d3.forceSimulation(root.descendants())
            .force("link", d3.forceLink(root.links()).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-100))
            .alphaDecay(0.01)
            .force("center", d3.forceCenter(svg.node().getBoundingClientRect().width / 2, svg.node().getBoundingClientRect().height / 2));

        const node = svg
            .join("g")
            .selectAll("image")
            .data(root.descendants())
            .join("image")
            .attr("href", d => {
                return `https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${d.data.data.labels[0].toLowerCase()}.png`
            })
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", "circle(40px at center)")
            .attr("cursor", "pointer")
            .on("click", function (event, d) {
                setSelectedNode(d.data.data);
                fetchChildren(d.data.id);
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

        const link = svg
            .selectAll("line")
            .data(root.links())
            .join("line")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x + 20)
                .attr("y1", d => d.source.y + 20)
                .attr("x2", d => d.target.x + 20)
                .attr("y2", d => d.target.y + 20);

            node
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });
    }, [nodes]);

    return (
        <div id="body" style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '100%', display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <svg ref={canvasRef} width="100%" height="100%"></svg>
            </div>
            {selectedNode && <div style={{ flex: 1 }}>
                <Sidepane selectedNode={selectedNode} />
            </div>}
        </div>
    );
}

export default Body;