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
    }, [selectedNode])
    return (
        <div className="blog-content">
            {content}
            <div id="further-exploration">
            </div>
        </div>
    )
}

export default Blog;