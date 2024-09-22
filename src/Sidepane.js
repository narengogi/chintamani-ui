import { reservedFields } from './constants';

function Sidepane({ selectedNode }) {

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
    }

    const tagStyle = {
        backgroundColor: '#f0f0f0',
        borderRadius: '0.5rem',
        padding: '0.25rem 0.5rem',
        margin: '0.25rem',
    }

    return (
        <div className="container" style={containerStyle}>
            <div className="title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={`https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${selectedNode.labels[0].toLowerCase()}.png`} alt={selectedNode.title} width={'auto'} height={50} style={{ marginRight: '25px' }} />
                <h1 className="title">{selectedNode.title}</h1>
                <img src={`https://raw.githubusercontent.com/narengogi/chintamani-ui/main/assets/icons/${selectedNode.labels[0].toLowerCase()}.png`} alt={selectedNode.title} width={'auto'} height={50} style={{ marginLeft: '25px' }} />
            </div>
            <div className="tags" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Tags</h3>
                {selectedNode.labels.map((label, index) => (
                    <span key={index} className="tag" style={tagStyle}>{label}</span>
                ))}
            </div>
            <div className="data">
                {Object.entries(selectedNode).map(([key, value]) => {
                    if (reservedFields.includes(key)) return;
                    return (
                        <div key={key} className="field">
                            <h3>{key}</h3>  
                            <p>{value}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Sidepane;