import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEllipsisV, FaArrowDown, FaSearch, FaThumbtack, FaTimes, FaTrash } from "react-icons/fa";
import Layout from "../components/Layout";

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const navigate = useNavigate();

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowTooltip(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://workflow-api-sourabh.free.beeceptor.com/workflows');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Transform the API data to match our component's expected format
        const transformedData = data.map(workflow => ({
          id: `#${workflow.id}`,
          name: workflow.name,
          lastEditedOn: workflow.lastEditedOn || 'No edit history',
          description: workflow.description || 'No description available',
          isFavorite: workflow.isFavorite || false,
        }));
        
        setWorkflows(transformedData);
      } catch (err) {
        console.error("Error fetching workflows:", err);
        setError("Failed to fetch workflows. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const toggleFavorite = async (id) => {
    try {
      const workflowId = id.replace('#', ''); // Remove the # from the ID
      const workflow = workflows.find(w => w.id === id);
      const newFavoriteStatus = !workflow.isFavorite;

      const response = await fetch(`https://workflow-api-sourabh.free.beeceptor.com/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: newFavoriteStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      // Update local state only after successful API call
      setWorkflows(workflows.map(workflow => 
        workflow.id === id 
          ? { ...workflow, isFavorite: newFavoriteStatus } 
          : workflow
      ));
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleExecute = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowExecuteModal(true);
  };

  const confirmExecution = () => {
    // In a real application, this would trigger the workflow execution API
    console.log(`Executing workflow ${selectedWorkflow.id}`);
    setShowExecuteModal(false);
    setSelectedWorkflow(null);
  };

  const cancelExecution = () => {
    setShowExecuteModal(false);
    setSelectedWorkflow(null);
  };

  const handleCreateNew = () => {
    navigate("/editor");
  };

  const toggleTooltip = (e, id) => {
    e.stopPropagation(); // Prevent the click from closing the tooltip immediately
    setShowTooltip(showTooltip === id ? null : id);
  };

  const initiateDelete = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowDeleteModal(true);
    setShowTooltip(null);
  };

  const confirmDelete = async () => {
    try {
      const workflowId = selectedWorkflow.id.replace('#', ''); // Remove the # from the ID
      const response = await fetch(`https://workflow-api-sourabh.free.beeceptor.com/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      // Update local state only after successful API call
      setWorkflows(workflows.filter(workflow => workflow.id !== selectedWorkflow.id));
      setShowDeleteModal(false);
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedWorkflow(null);
  };

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Workflow Builder</h2>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            + Create New Process
          </button>
        </div>

        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search By Workflow Name/ID"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Loading workflows...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Edited On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pinned
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {workflow.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.lastEditedOn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-sm truncate">
                        {workflow.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => toggleFavorite(workflow.id)} className="transform transition-transform hover:scale-110">
                          {workflow.isFavorite ? (
                            <FaThumbtack className="text-yellow-400 h-5 w-5 transform -rotate-45" />
                          ) : (
                            <FaThumbtack className="text-gray-300 h-5 w-5 transform rotate-45" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleExecute(workflow)}
                            className="text-gray-700 bg-gray-100 px-3 py-1 rounded border hover:bg-gray-200"
                          >
                            Execute
                          </button>
                          <button
                            onClick={() => handleEdit(workflow.id)}
                            className="text-gray-700 bg-gray-100 px-3 py-1 rounded border hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <div className="relative">
                            <button 
                              className="text-gray-500 hover:text-gray-700"
                              onClick={(e) => toggleTooltip(e, workflow.id)}
                            >
                              <FaEllipsisV />
                            </button>
                            {showTooltip === workflow.id && (
                              <div className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                    onClick={() => initiateDelete(workflow)}
                                  >
                                    <FaTrash className="mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <button className="text-gray-500 hover:text-gray-700">
                            <FaArrowDown />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWorkflows.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No workflows found matching &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredWorkflows.length} of {workflows.length} workflows
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100">
                1
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                2
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                3
              </button>
              <span className="px-1">...</span>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                15
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Confirmation Modal */}
      {showExecuteModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 relative">
              <button 
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
                onClick={cancelExecution}
              >
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  &quot;Are You Sure You Want To Execute The Process &apos;{selectedWorkflow.name}&apos;?
                </h3>
                <p className="text-sm text-red-500">
                  You Cannot Undo This Step
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 border-t pt-4">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={cancelExecution}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  onClick={confirmExecution}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 relative">
              <button 
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
                onClick={cancelDelete}
              >
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  &quot;Are You Sure You Want To Delete &apos;{selectedWorkflow.name}&apos;?
                </h3>
                <p className="text-sm text-red-500">
                  You Cannot Undo This Step
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 border-t pt-4">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={cancelDelete}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WorkflowList;
