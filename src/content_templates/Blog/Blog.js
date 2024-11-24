import { useEffect, useState } from "react";
import './styles.css';
import * as d3 from 'd3';

function Blog(selectedNode) {
    const [content, setContent] = useState('');
    useEffect(()=> {
        const fetchContent = async () => {
            const content = await fetch(selectedNode.body);
            const text = await content.text();
            setContent(text);
        }
        fetchContent();
        const svg = d3.select('svg');
        const parents = svg.selectAll('g').data().find(d => d.data.id === selectedNode.parentId);
        console.log(parents.data());
    }, [selectedNode])
    return (
        <div className="blog-content">
            {content}
            <div id="further-exploration">
                {/* <div id="parents">
                    <h3>Parents:</h3>
                    {selectedNode.parents.map((parent) => {
                        return <p>{parent.title}</p>
                    })}
                </div>
                <div id="children">
                    <h3>Children:</h3>
                    {selectedNode.children.map((child) => {
                        return <p>{child.title}</p>
                    })}
                </div> */}
            </div>
        </div>
    )
}

export default Blog;