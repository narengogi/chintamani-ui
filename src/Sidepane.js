import { reservedFields } from './constants';
import './styles.js/cyberpunk.css';
import ContentStyles from './content_templates';
function Sidepane({ selectedNode, setSelectedNode, nodes }) {

    const containerStyle = {
        height: 'calc(100% - 2rem)',
        border: '1px solid black',
        margin: '0.25rem',
        padding: '0.5rem',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'black',
    }

    const tagStyle = {
        backgroundColor: '#f0f0f0',
        borderRadius: '0.5rem',
        padding: '0.25rem 0.5rem',
        margin: '0.25rem',
        boxShadow: '#ff00de',
    }

    const renderContent = (selectedNode) => {
        let contentStyle = ContentStyles.get(selectedNode.labels[0].toUpperCase());
        if (contentStyle) {
            return contentStyle(selectedNode);
        } else {
            return (
                <div>
                    {Object.entries(selectedNode).map(([key, value]) => {
                        return (
                            <div key={key} className="field">
                                <h3 className='neon-text'>{key}</h3>
                                <p className='content'>{value}</p>
                            </div>
                        )
                    })}
                </div>
            )
        }
    }

    return (
        <div className="sidepaneContainer" style={containerStyle}>
            <div className="title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img className='glitch' src={`https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${selectedNode.labels[0].toLowerCase()}.png`} alt={selectedNode.title} width={'auto'} height={50} style={{ marginRight: '25px' }} />
                <h1 className="flyer">{selectedNode.title}</h1>
                <img className='glitch' src={`https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${selectedNode.labels[0].toLowerCase()}.png`} alt={selectedNode.title} width={'auto'} height={50} style={{ marginLeft: '25px' }} />
            </div>
            <div className="tags" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Tags</h3>
                {selectedNode.labels.map((label, index) => (
                    <span key={index} className="tag neon-text" style={tagStyle}>{label}</span>
                ))}
            </div>
            <div className="data">
                <div id="content">
                    {renderContent(selectedNode)}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setSelectedNode(null)}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default Sidepane;