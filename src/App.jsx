import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { generateSampleData } from './data/contributionModel';
import HomeFeed from './components/HomeFeed';
import ContributionChain from './components/ContributionChain';
import AddContribution from './components/AddContribution';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/feed', label: 'Feed', icon: '📰' },
    { path: '/add', label: 'Add Contribution', icon: '➕' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/feed" className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-gray-900">ContribCast</span>
              <span className="text-sm text-gray-500 font-medium">v0.1</span>
            </Link>
          </div>
          
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App component
const App = () => {
  useEffect(() => {
    // Initialize with sample data if localStorage is empty
    generateSampleData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/feed" element={<HomeFeed />} />
            <Route path="/chain/:id" element={<ContributionChain />} />
            <Route path="/add" element={<AddContribution />} />
            <Route path="*" element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <Link to="/feed" className="text-blue-600 hover:text-blue-800">
                  Return to Feed
                </Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
