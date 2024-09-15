import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function Body() {
    const canvasRef = useRef(null);
    const [nodes, setNodes] = useState([]);

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
            const transformedData = data.map(d=>d.node);
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
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(svg.node().getBoundingClientRect().width / 2, svg.node().getBoundingClientRect().height / 2));

        const link = svg
            .selectAll("line")
            .data(root.links())
            .join("line")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.6);

        const node = svg
            .join("g")
            .selectAll("image")
            .data(root.descendants())
            .join("image")
            .attr("href", d => {
                console.log(d.data.data.tags[0])
                return `https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/Naren.png`
            })
            .attr("width", 80)
            .attr("height", 80)
            .attr("clip-path", "circle(40px at center)")
            .on("click", function(event, d) {
                fetchChildren(d.data.id);
            });

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });
    }, [nodes]);

    return (
        <div id="body" style={{ height: '96vh', width: '96vw' }}>
            <svg ref={canvasRef} width="100%" height="100%"></svg>
        </div>
    );
}

export default Body;