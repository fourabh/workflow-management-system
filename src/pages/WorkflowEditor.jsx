import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import PropTypes from 'prop-types';
import 'reactflow/dist/style.css';
import Layout from '../components/Layout';
import CustomNode from '../components/CustomNode';
import { FaArrowLeft, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

// Define node types for the workflow editor
const nodeTypes = {
  customNode: CustomNode,
};

// Initial nodes for a new workflow
const initialNodes = [
  {
    id: 'start',
    type: 'customNode',
    data: { label: 'Start', nodeType: 'start' },
    position: { x: 250, y: 50 },
  },
  {
    id: 'end',
    type: 'customNode',
    data: { label: 'End', nodeType: 'end' },
    position: { x: 250, y: 200 },
  },
];

// Initial edges for a new workflow
const initialEdges = [
  {
    id: 'start-end',
    source: 'start',
    target: 'end',
    type: 'buttonEdge',
    style: { 
      strokeWidth: 2,
      stroke: '#2563eb', // Blue color
    },
    markerEnd: { 
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#2563eb',
    },
    animated: true,
  },
];

// Custom Edge with + button
const ButtonEdge = ({ id, style = {} }) => {
  const [edgePath, setEdgePath] = useState('');
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const edgeRef = useCallback((ref) => {
    if (!ref) return;
    
    try {
      // Get the path of the edge
      const path = ref.getElementsByTagName('path')[0];
      if (!path) return;
      
      // Get the path data
      const pathD = path.getAttribute('d');
      if (pathD) {
        setEdgePath(pathD);
      
        // Safely calculate the center point of the path
        try {
          const pathLength = path.getTotalLength();
          if (pathLength > 0) {
            const midPoint = path.getPointAtLength(pathLength / 2);
            if (midPoint && typeof midPoint.x === 'number' && typeof midPoint.y === 'number') {
              setCenterX(midPoint.x);
              setCenterY(midPoint.y);
            }
          }
        } catch (pathErr) {
          console.error('Error calculating path midpoint:', pathErr);
          // Fallback to simple middle point estimation from path data
          const points = pathD.split(' ').filter(p => !isNaN(parseFloat(p)));
          if (points.length >= 4) {
            // Roughly estimate a middle point from the available coordinates
            const xValues = points.filter((_, i) => i % 2 === 0).map(parseFloat);
            const yValues = points.filter((_, i) => i % 2 === 1).map(parseFloat);
            
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            setCenterX((minX + maxX) / 2);
            setCenterY((minY + maxY) / 2);
          }
        }
      }
    } catch (err) {
      console.error('Error in edge ref handling:', err);
      setHasError(true);
    }
  }, []);

  // Handle mouse over on edge
  const handleMouseOver = () => {
    if (!hasError) setShowButton(true);
  };

  // Handle mouse out on edge
  const handleMouseOut = () => {
    setShowButton(false);
  };

  // Render a simple edge if there's an error
  if (hasError) {
    return (
      <path 
        id={id} 
        style={style} 
        className="react-flow__edge-path" 
        markerEnd="url(#react-flow__arrowclosed)"
      />
    );
  }

  return (
    <g 
      className="react-flow__edge-path" 
      onMouseEnter={handleMouseOver} 
      onMouseLeave={handleMouseOut}
      ref={edgeRef}
    >
      <path 
        id={id} 
        style={{
          ...style,
          strokeDasharray: style.animated ? '5,5' : 'none',
          animation: style.animated ? 'dashdraw 1s linear infinite' : 'none',
        }}
        d={edgePath || 'M0 0'}
        className="react-flow__edge-path" 
        markerEnd="url(#react-flow__arrowclosed)"
      />
      {showButton && centerX !== 0 && centerY !== 0 && (
        <foreignObject
          width={24}
          height={24}
          x={centerX - 12}
          y={centerY - 12}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center justify-center w-full h-full rounded-full bg-white border-2 border-blue-600 cursor-pointer hover:bg-blue-50 transition-colors">
            <FaPlus className="text-blue-600" />
          </div>
        </foreignObject>
      )}
    </g>
  );
};

ButtonEdge.propTypes = {
  id: PropTypes.string.isRequired,
  style: PropTypes.object,
};

// Define edge types
const edgeTypes = {
  buttonEdge: ButtonEdge,
};

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Load workflow data if editing an existing workflow
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`https://workflow-api-sourabh.free.beeceptor.com/workflows`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(workflows => {
          // Find the specific workflow by id
          const workflow = workflows.find(w => w.id === parseInt(id));
          if (!workflow) {
            throw new Error('Workflow not found');
          }

          // Transform the workflow data to match our format
          const transformedNodes = workflow.nodes.map(node => ({
            id: node.id,
            type: 'customNode',
            data: { 
              label: node.label || getNodeLabel(node.nodeType),
              nodeType: node.nodeType,
              endpoint: node.endpoint,
              recipient: node.recipient
            },
            position: node.position || { x: 250, y: 150 }
          }));

          const transformedEdges = workflow.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'buttonEdge',
            style: { 
              strokeWidth: 2,
              stroke: '#2563eb'
            },
            markerEnd: { 
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#2563eb'
            },
            animated: true
          }));

          setWorkflowName(workflow.name);
          setWorkflowDescription(workflow.description || '');
          setNodes(transformedNodes);
          setEdges(transformedEdges);
        })
        .catch(error => {
          console.error('Error fetching workflow:', error);
          alert('Error loading workflow. Please try again later.');
          navigate('/workflows');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, setNodes, setEdges, navigate]);

  // Convert initial edges to button edges
  useEffect(() => {
    if (!id) {
      // Only apply this to new workflows
      setEdges((eds) => 
        eds.map(edge => ({
          ...edge,
          type: 'buttonEdge',
        }))
      );
    }
  }, [id, setEdges]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params) => {
      // Create a new connection with the button edge type
      const newEdge = {
        ...params,
        type: 'buttonEdge',
        style: { 
          strokeWidth: 2,
          stroke: '#2563eb', // Blue color
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#2563eb',
        },
        animated: true,
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Handle edge click
  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge);
    
    try {
      // Find the source and target nodes to calculate the midpoint
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (sourceNode && targetNode && 
          sourceNode.position && targetNode.position && 
          typeof sourceNode.position.x === 'number' && 
          typeof sourceNode.position.y === 'number' &&
          typeof targetNode.position.x === 'number' && 
          typeof targetNode.position.y === 'number') {
        // Calculate the midpoint between the two nodes
        const midX = (sourceNode.position.x + targetNode.position.x) / 2;
        const midY = (sourceNode.position.y + targetNode.position.y) / 2;
        
        // Open the node menu at the midpoint
        setMenuPosition({ x: midX, y: midY });
        setShowNodeMenu(true);
      } else {
        console.warn('Unable to calculate midpoint: invalid node positions', { sourceNode, targetNode });
      }
    } catch (err) {
      console.error('Error handling edge click:', err);
      // Set a fallback position for the menu
      setMenuPosition({ x: 250, y: 200 });
      setShowNodeMenu(true);
    }
  }, [nodes]);

  // Handle pane click (deselect node)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setShowNodeMenu(false);
  }, []);

  // Handle right-click to open node menu
  const onPaneContextMenu = useCallback(
    (event) => {
      // Prevent default context menu
      event.preventDefault();

      // Get the position where the user clicked
      const position = {
        x: event.position[0],
        y: event.position[1],
      };

      setMenuPosition(position);
      setShowNodeMenu(true);
    },
    []
  );

  // Add new node to the workflow
  const addNode = (nodeType) => {
    try {
      // Create a new node
      const newNode = {
        id: `${nodeType}_${Date.now()}`,
        type: 'customNode',
        data: { label: getNodeLabel(nodeType), nodeType },
        position: menuPosition,
      };

      // If adding a node between two nodes (from edge click)
      if (selectedEdge) {
        const sourceNode = nodes.find(node => node.id === selectedEdge.source);
        const targetNode = nodes.find(node => node.id === selectedEdge.target);
        
        // Position the new node in between the source and target nodes
        if (sourceNode && targetNode && 
            sourceNode.position && targetNode.position &&
            typeof sourceNode.position.x === 'number' && 
            typeof sourceNode.position.y === 'number' &&
            typeof targetNode.position.x === 'number' && 
            typeof targetNode.position.y === 'number') {
          
          newNode.position = {
            x: (sourceNode.position.x + targetNode.position.x) / 2,
            y: (sourceNode.position.y + targetNode.position.y) / 2 + 10, // Slight offset to avoid overlap
          };
          
          // Delete the original edge
          setEdges(edges => edges.filter(e => e.id !== selectedEdge.id));
          
          // Create two new edges
          const newEdge1 = {
            id: `e-${sourceNode.id}-${newNode.id}`,
            source: sourceNode.id,
            target: newNode.id,
            type: 'buttonEdge',
            style: { 
              strokeWidth: 2,
              stroke: '#2563eb', // Blue color
            },
            markerEnd: { 
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#2563eb',
            },
            animated: true,
          };
          
          const newEdge2 = {
            id: `e-${newNode.id}-${targetNode.id}`,
            source: newNode.id,
            target: targetNode.id,
            type: 'buttonEdge',
            style: { 
              strokeWidth: 2,
              stroke: '#2563eb', // Blue color
            },
            markerEnd: { 
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#2563eb',
            },
            animated: true,
          };
          
          // Add the new node and edges
          setNodes(nodes => [...nodes, newNode]);
          setEdges(edges => [...edges, newEdge1, newEdge2]);
        } else {
          console.warn('Unable to position node between source and target: invalid node positions');
          // Just add the node at the menu position as fallback
          setNodes((nds) => nds.concat(newNode));
        }
      } else {
        // Just add the node at the menu position
        setNodes((nds) => nds.concat(newNode));
      }
    } catch (err) {
      console.error('Error adding node:', err);
      // Add simple node at a default position as fallback
      const fallbackNode = {
        id: `${nodeType}_fallback_${Date.now()}`,
        type: 'customNode',
        data: { label: getNodeLabel(nodeType), nodeType },
        position: { x: 250, y: 200 },
      };
      setNodes((nds) => nds.concat(fallbackNode));
    }
    
    setShowNodeMenu(false);
    setSelectedEdge(null);
  };

  // Get label for node based on type
  const getNodeLabel = (nodeType) => {
    switch (nodeType) {
      case 'api':
        return 'API Call';
      case 'email':
        return 'Email';
      case 'decision':
        return 'Decision';
      case 'end':
        return 'End';
      default:
        return 'Node';
    }
  };

  // Open save modal
  const openSaveModal = () => {
    setShowSaveModal(true);
  };

  // Save workflow
  const saveWorkflow = () => {
    setIsLoading(true);
    
    const workflowData = {
      id: id ? parseInt(id) : Date.now(),
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(node => ({
        id: node.id,
        label: node.data.label,
        nodeType: node.data.nodeType,
        endpoint: node.data.endpoint,
        recipient: node.data.recipient,
        position: node.position
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      }))
    };

    // If editing existing workflow, use PUT, otherwise POST
    const method = id ? 'PUT' : 'POST';
    const url = `https://workflow-api-sourabh.free.beeceptor.com/workflows${id ? `/${id}` : ''}`;

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflowData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        setShowSaveModal(false);
        alert('Workflow saved successfully!');
        navigate('/workflows');
      })
      .catch(error => {
        console.error('Error saving workflow:', error);
        alert('Error saving workflow. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Go back to workflow list
  const goBack = () => {
    navigate('/workflows');
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-150px)] flex flex-col">
        <div className="p-3 bg-white shadow-sm flex items-center">
          <button
            onClick={goBack}
            className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100 rounded-md text-gray-600"
          >
            <FaArrowLeft className="text-sm" /> Go Back
          </button>
          <div className="border-l border-gray-300 mx-3 h-6"></div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="px-2 py-1 border-none focus:outline-none focus:ring-0 font-medium text-gray-800"
          />
          <button
            onClick={openSaveModal}
            className="flex items-center gap-1 px-4 py-1 ml-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            <FaSave />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading workflow...</p>
          </div>
        ) : (
          <div className="flex-1 flex">
            <div className="flex-1 h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onPaneContextMenu={onPaneContextMenu}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </div>

            {selectedNode && (
              <div className="w-80 p-4 bg-white border-l border-gray-200 overflow-y-auto">
                <h3 className="text-lg font-medium mb-4">Node Properties</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedNode.data.nodeType}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Label</label>
                    <input
                      type="text"
                      value={selectedNode.data.label}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((node) => {
                          if (node.id === selectedNode.id) {
                            return {
                              ...node,
                              data: {
                                ...node.data,
                                label: e.target.value,
                              },
                            };
                          }
                          return node;
                        });
                        setNodes(updatedNodes);
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  {selectedNode.data.nodeType === 'api' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">API Endpoint</label>
                      <input
                        type="text"
                        value={selectedNode.data.endpoint || ''}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((node) => {
                            if (node.id === selectedNode.id) {
                              return {
                                ...node,
                                data: {
                                  ...node.data,
                                  endpoint: e.target.value,
                                },
                              };
                            }
                            return node;
                          });
                          setNodes(updatedNodes);
                        }}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                  {selectedNode.data.nodeType === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipient</label>
                      <input
                        type="email"
                        value={selectedNode.data.recipient || ''}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((node) => {
                            if (node.id === selectedNode.id) {
                              return {
                                ...node,
                                data: {
                                  ...node.data,
                                  recipient: e.target.value,
                                },
                              };
                            }
                            return node;
                          });
                          setNodes(updatedNodes);
                        }}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                  {selectedNode.data.nodeType !== 'start' && selectedNode.data.nodeType !== 'end' && (
                    <button
                      onClick={() => {
                        // Find connected edges
                        const connectedEdges = edges.filter(
                          (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id
                        );
                        
                        // Get unique nodes connected to this node
                        const sourceNodes = connectedEdges
                          .filter(edge => edge.target === selectedNode.id)
                          .map(edge => edge.source);
                        
                        const targetNodes = connectedEdges
                          .filter(edge => edge.source === selectedNode.id)
                          .map(edge => edge.target);
                        
                        // Delete the existing edges connected to this node
                        const updatedEdges = edges.filter(
                          (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
                        );
                        
                        // Create new edges between connected nodes
                        sourceNodes.forEach(sourceId => {
                          targetNodes.forEach(targetId => {
                            const newEdge = {
                              id: `e-${sourceId}-${targetId}`,
                              source: sourceId,
                              target: targetId,
                              type: 'buttonEdge',
                              style: { strokeWidth: 2 },
                              markerEnd: { type: MarkerType.ArrowClosed },
                            };
                            updatedEdges.push(newEdge);
                          });
                        });
                        
                        // Remove the node
                        const updatedNodes = nodes.filter((node) => node.id !== selectedNode.id);
                        
                        setNodes(updatedNodes);
                        setEdges(updatedEdges);
                        setSelectedNode(null);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete Node
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showNodeMenu && (
          <div
            className="absolute bg-white shadow-md rounded-md p-2 z-10"
            style={{ left: menuPosition.x, top: menuPosition.y }}
          >
            <div className="text-sm font-medium mb-2">Add Node</div>
            <div className="space-y-1">
              <button
                onClick={() => addNode('api')}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                API Call
              </button>
              <button
                onClick={() => addNode('email')}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                Email
              </button>
              <button
                onClick={() => addNode('decision')}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                Decision
              </button>
            </div>
          </div>
        )}

        {/* Save Workflow Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowSaveModal(false)}
                >
                  <FaTimes className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-medium text-gray-900 mb-6">
                  Save your workflow
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Name here"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Write here.."
                      rows={4}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-8 border-t pt-4 flex justify-end">
                  <button
                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                    onClick={saveWorkflow}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkflowEditor; 