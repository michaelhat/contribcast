import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Individual contribution card component
const ContributionCard = ({ contribution }) => {
  const typeInfo = getTypeInfo(contribution.type);
  const [resonance, setResonance] = useState(contribution.resonance);

  const handleResonance = () => {
    const updated = storageUtils.updateResonance(contribution.id, 1);
    if (updated) {
      setResonance(updated.resonance);
    }
  };

  const getRemixDepth = () => {
    let depth = 0;
    let current = contribution;
    const contributions = storageUtils.getContributions();
    
    while (current && current.parentContributionId) {
      depth++;
      current = contributions.find(c => c.id === current.parentContributionId);
      if (depth > 10) break; // Prevent infinite loops
    }
    
    return depth;
  };

  const remixDepth = getRemixDepth();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {contribution.contributor.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{contribution.contributor}</h3>
            <p className="text-sm text-gray-500">{formatTimestamp(contribution.timestamp)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeInfo.colorClass}`}>
            <span className="mr-1">{typeInfo.icon}</span>
            {contribution.type}
          </span>
          {remixDepth > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              🔄 Depth {remixDepth}
            </span>
          )}
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
          
          <Link
            to={`/chain/${contribution.id}`}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            View Chain
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main HomeFeed component
const HomeFeed = () => {
  const [contributions, setContributions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = () => {
    const allContributions = storageUtils.getContributions();
    setContributions(allContributions);
  };

  const filteredContributions = contributions.filter(contribution => {
    if (filter === 'all') return true;
    return contribution.type === filter;
  });

  const filterButtons = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: CONTRIBUTION_TYPES.COMMENT, label: 'Comments', icon: '💬' },
    { key: CONTRIBUTION_TYPES.EDIT, label: 'Edits', icon: '✏️' },
    { key: CONTRIBUTION_TYPES.REMIX, label: 'Remixes', icon: '🎨' },
    { key: CONTRIBUTION_TYPES.SUGGESTION, label: 'Suggestions', icon: '💡' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contribution Feed</h1>
          <p className="mt-2 text-gray-600">Recent contributions to Farcaster projects</p>
        </div>
        
        <Link
          to="/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">➕</span>
          Add Contribution
        </Link>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((button) => (
          <button
            key={button.key}
            onClick={() => setFilter(button.key)}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === button.key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{button.icon}</span>
            {button.label}
          </button>
        ))}
      </div>

      {/* Contributions list */}
      <div className="space-y-4">
        {filteredContributions.length > 0 ? (
          filteredContributions.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="text-4xl mb-4 block">📝</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contributions yet</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Be the first to add a contribution!'
                : `No ${filter.toLowerCase()} contributions found.`}
            </p>
            <Link
              to="/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add First Contribution
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
