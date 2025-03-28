import { memo } from 'react';
import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable = true }) => {
  // Get node style based on node type
  const getNodeStyle = () => {
    switch (data.nodeType) {
      case 'start':
        return {
          backgroundColor: '#7cb342', // Green
          borderColor: '#558b2f',
          color: 'white',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'end':
        return {
          backgroundColor: '#e53935', // Red
          borderColor: '#c62828',
          color: 'white',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'api':
        return {
          backgroundColor: '#ffb74d', // Orange
          borderColor: '#f57c00',
          color: 'black',
        };
      case 'email':
        return {
          backgroundColor: '#64b5f6', // Blue
          borderColor: '#1976d2',
          color: 'white',
        };
      case 'decision':
        return {
          backgroundColor: '#9575cd', // Purple
          borderColor: '#5e35b1',
          color: 'white',
          transform: 'rotate(45deg)',
          width: '60px',
          height: '60px',
        };
      default:
        return {
          backgroundColor: '#e0e0e0',
          borderColor: '#9e9e9e',
        };
    }
  };

  // Get label style based on node type
  const getLabelStyle = () => {
    if (data.nodeType === 'decision') {
      return { transform: 'rotate(-45deg)' };
    }
    return {};
  };

  return (
    <div
      className={`px-4 py-2 border-2 rounded-md shadow-md ${
        data.nodeType !== 'decision' ? 'min-w-[150px] text-center' : ''
      }`}
      style={getNodeStyle()}
    >
      {data.nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      )}
      
      <div style={getLabelStyle()}>{data.label}</div>
      
      {data.nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      )}

      {data.nodeType === 'decision' && (
        <>
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            isConnectable={isConnectable}
            className="w-2 h-2"
            style={{ left: '-10px', top: '50%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            isConnectable={isConnectable}
            className="w-2 h-2"
            style={{ right: '-10px', top: '50%' }}
          />
        </>
      )}
    </div>
  );
};

CustomNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    nodeType: PropTypes.string.isRequired,
    endpoint: PropTypes.string,
    recipient: PropTypes.string,
  }).isRequired,
  isConnectable: PropTypes.bool,
};

export default memo(CustomNode); 