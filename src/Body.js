import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Body() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = d3.select(canvasRef.current);
            canvas.style('background-color', 'black');
        }
    }, []);

    return (
        <div id="body" style={{ height: '96vh', width: '96vw' }}>
            <svg ref={canvasRef} width="100%" height="100%" style={{ backgroundColor: 'black' }}></svg>
        </div>
    );
}

export default Body;