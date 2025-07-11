import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storageUtils, CONTRIBUTION_TYPES } from '../data/contributionModel';

// Utility function to get type-specific styling and icon
const getTypeInfo = (type) => {
  const typeMap = {
    [CONTRIBUTION_TYPES.COMMENT]: {
      icon: '💬',
      colorClass: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    [CONTRIBUTION_TYPES.EDIT]: {
      icon: '✏️',
      colorClass: 'bg-green-100 text-green-800 border-green-200'
    },
    [CONTRIBUTION_TYPES.REMIX]: {
      icon: '🎨',
      colorClass: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    [CONTRIBUTION_TYPES.SUGGESTION]: {
      icon: '💡',
      colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  };
  
  return typeMap[type] || { icon: '📝', colorClass: 'bg-gray-100 text-gray-800 border-gray-200' };
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Individual chain item component
const ChainItem = ({ contribution, depth, isLast, isFirst }) => {
  const typeInfo = getTypeInfo(contribution.type);
  const [resonance, setResonance] = useState(contribution.resonance);

  const handleResonance = () => {
    const updated = storageUtils.updateResonance(contribution.id, 1);
    if (updated) {
      setResonance(updated.resonance);
    }
  };

  const handleFork = () => {
    // For now, just redirect to add contribution with parent ID
    const searchParams = new URLSearchParams({
      parentId: contribution.id,
      projectId: contribution.projectId
    });
    window.location.href = `/add?${searchParams.toString()}`;
  };

  return (
    <div className="relative">
      {/* Connection line */}
      {!isFirst && (
        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-300"></div>
      )}
      
      {/* Continuation line */}
      {!isLast && depth > 0 && (
        <div className="absolute left-6 bottom-0 w-0.5 h-4 bg-gray-300"></div>
      )}

      <div className={`flex space-x-4 ${depth > 0 ? 'ml-8' : ''}`}>
        {/* Avatar and connection */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
            {contribution.contributor.charAt(0).toUpperCase()}
          </div>
          {!isLast && (
            <div className="w-0.5 bg-gray-300 flex-1 mt-2"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-gray-900">{contribution.contributor}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeInfo.colorClass}`}>
                  <span className="mr-1">{typeInfo.icon}</span>
                  {contribution.type}
                </span>
                {depth > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    🔄 Depth {depth}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatTimestamp(contribution.timestamp)}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed">{contribution.description}</p>
            
            {contribution.tags && contribution.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {contribution.tags.map((tag, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Project: <span className="font-medium text-gray-900">{contribution.projectId}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResonance}
                className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <span>🌟</span>
                <span>{resonance}</span>
              </button>
              
              <button
                onClick={handleFork}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-1">🔀</span>
                Fork
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ContributionChain component
const ContributionChain = () => {
  const { id } = useParams();
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rootContribution, setRootContribution] = useState(null);

  useEffect(() => {
    loadChain();
  }, [id]);

  const loadChain = () => {
    setLoading(true);
    try {
      const contributionChain = storageUtils.getContributionChain(id);
      setChain(contributionChain);
      
      if (contributionChain.length > 0) {
        setRootContribution(contributionChain[0]);
      }
    } catch (error) {
      console.error('Error loading contribution chain:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading contribution chain...</p>
        </div>
      </div>
    );
  }

  if (chain.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <span className="text-4xl mb-4 block">🔍</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contribution not found</h3>
        <p className="text-gray-500 mb-4">
          The contribution you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const totalContributions = chain.length;
  const maxDepth = Math.max(...chain.map(c => c.depth));
  const contributors = [...new Set(chain.map(c => c.contributor))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link 
              to="/feed" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Feed
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Contribution Chain</h1>
          {rootContribution && (
            <p className="mt-2 text-gray-600">
              Project: <span className="font-medium">{rootContribution.projectId}</span>
            </p>
          )}
        </div>
        
        <Link
          to={`/add?parentId=${id}&projectId=${rootContribution?.projectId || ''}`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">🔀</span>
          Add to Chain
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Contributions</p>
              <p className="text-2xl font-semibold text-gray-900">{totalContributions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Max Remix Depth</p>
              <p className="text-2xl font-semibold text-gray-900">{maxDepth}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Contributors</p>
              <p className="text-2xl font-semibold text-gray-900">{contributors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Contribution Timeline</h2>
        
        <div className="space-y-0">
          {chain.map((contribution, index) => (
            <ChainItem
              key={contribution.id}
              contribution={contribution}
              depth={contribution.depth}
              isFirst={index === 0}
              isLast={index === chain.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributionChain;
