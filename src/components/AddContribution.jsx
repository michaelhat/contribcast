import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storageUtils, CONTRIBUTION_TYPES, Contribution } from '../data/contributionModel';

const AddContribution = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Form state
  const [formData, setFormData] = useState({
    contributor: '',
    projectId: '',
    type: CONTRIBUTION_TYPES.COMMENT,
    description: '',
    tags: '',
    parentContributionId: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [parentContribution, setParentContribution] = useState(null);

  // Initialize form with URL parameters if present
  useEffect(() => {
    const parentId = searchParams.get('parentId');
    const projectId = searchParams.get('projectId');
    
    if (parentId) {
      const parent = storageUtils.getContributionById(parentId);
      if (parent) {
        setParentContribution(parent);
        setFormData(prev => ({
          ...prev,
          parentContributionId: parentId,
          projectId: parent.projectId,
          type: CONTRIBUTION_TYPES.REMIX // Default to remix when forking
        }));
      }
    } else if (projectId) {
      setFormData(prev => ({
        ...prev,
        projectId: projectId
      }));
    }
  }, [searchParams]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.contributor.trim()) {
      newErrors.contributor = 'Contributor name is required';
    }
    
    if (!formData.projectId.trim()) {
      newErrors.projectId = 'Project ID/URL is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create contribution
      const contribution = new Contribution({
        contributor: formData.contributor.trim(),
        projectId: formData.projectId.trim(),
        type: formData.type,
        description: formData.description.trim(),
        tags: tags,
        parentContributionId: formData.parentContributionId
      });
      
      // Save to storage
      storageUtils.addContribution(contribution);
      
      // Navigate to the chain view or feed
      if (contribution.parentContributionId) {
        navigate(`/chain/${contribution.id}`);
      } else {
        navigate('/feed');
      }
    } catch (error) {
      console.error('Error saving contribution:', error);
      setErrors({ submit: 'Failed to save contribution. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get type-specific info
  const getTypeInfo = (type) => {
    const typeMap = {
      [CONTRIBUTION_TYPES.COMMENT]: { icon: '💬', description: 'Add a comment or feedback' },
      [CONTRIBUTION_TYPES.EDIT]: { icon: '✏️', description: 'Modify or improve existing code/content' },
      [CONTRIBUTION_TYPES.REMIX]: { icon: '🎨', description: 'Create a variation or fork' },
      [CONTRIBUTION_TYPES.SUGGESTION]: { icon: '💡', description: 'Propose an idea or feature' }
    };
    
    return typeMap[type] || { icon: '📝', description: 'General contribution' };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {parentContribution ? 'Add to Chain' : 'Add Contribution'}
        </h1>
        <p className="mt-2 text-gray-600">
          {parentContribution 
            ? `Contributing to the chain started by ${parentContribution.contributor}`
            : 'Share your contribution to a Farcaster project'
          }
        </p>
      </div>

      {/* Parent contribution preview */}
      {parentContribution && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Building on top of:</h3>
          <div className="bg-white rounded-md p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-gray-900">{parentContribution.contributor}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {parentContribution.type}
              </span>
            </div>
            <p className="text-sm text-gray-700">{parentContribution.description}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6 space-y-6">
          {/* Contributor Name */}
          <div>
            <label htmlFor="contributor" className="block text-sm font-medium text-gray-700 mb-2">
              Contributor Name *
            </label>
            <input
              type="text"
              id="contributor"
              name="contributor"
              value={formData.contributor}
              onChange={handleInputChange}
              placeholder="e.g., alice.eth, bob.fc"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.contributor ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.contributor && (
              <p className="mt-1 text-sm text-red-600">{errors.contributor}</p>
            )}
          </div>

          {/* Project ID/URL */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
              Related Project URL/ID *
            </label>
            <input
              type="text"
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              placeholder="e.g., farcaster-frames-toolkit, https://github.com/..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.projectId ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
            )}
          </div>

          {/* Contribution Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Contribution Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(CONTRIBUTION_TYPES).map((type) => {
                const typeInfo = getTypeInfo(type);
                return (
                  <label
                    key={type}
                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{type}</div>
                        <div className="text-xs text-gray-500">{typeInfo.description}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your contribution in detail..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Minimum 10 characters. Current: {formData.description.length}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., typescript, bugfix, ui, feature-request"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Add Contribution'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContribution;
