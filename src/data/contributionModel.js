// Data model for contributions
export const CONTRIBUTION_TYPES = {
  COMMENT: 'Comment',
  EDIT: 'Edit',
  REMIX: 'Remix',
  SUGGESTION: 'Suggestion'
};

export class Contribution {
  constructor({
    id = null,
    contributor,
    projectId,
    type,
    description,
    timestamp = new Date().toISOString(),
    parentContributionId = null,
    tags = [],
    resonance = 0
  }) {
    this.id = id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.contributor = contributor;
    this.projectId = projectId;
    this.type = type;
    this.description = description;
    this.timestamp = timestamp;
    this.parentContributionId = parentContributionId;
    this.tags = tags;
    this.resonance = resonance;
  }
}

// Local storage utilities
export const STORAGE_KEY = 'contribcast_contributions';

export const storageUtils = {
  getContributions: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored).map(data => new Contribution(data));
    } catch (error) {
      console.error('Error loading contributions from localStorage:', error);
      return [];
    }
  },

  saveContributions: (contributions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
    } catch (error) {
      console.error('Error saving contributions to localStorage:', error);
    }
  },

  addContribution: (contribution) => {
    const contributions = storageUtils.getContributions();
    contributions.unshift(contribution); // Add to beginning for chronological order
    storageUtils.saveContributions(contributions);
    return contribution;
  },

  getContributionById: (id) => {
    const contributions = storageUtils.getContributions();
    return contributions.find(c => c.id === id);
  },

  getContributionsByProject: (projectId) => {
    const contributions = storageUtils.getContributions();
    return contributions.filter(c => c.projectId === projectId);
  },

  getContributionChain: (contributionId) => {
    const contributions = storageUtils.getContributions();
    const chain = [];
    const visited = new Set();
    
    // Find the root contribution
    let current = contributions.find(c => c.id === contributionId);
    if (!current) return [];

    // Traverse up to find the root
    while (current && current.parentContributionId && !visited.has(current.id)) {
      visited.add(current.id);
      current = contributions.find(c => c.id === current.parentContributionId);
    }
    
    if (!current) return [];
    
    // Now traverse down from root to build the full chain
    const buildChain = (contribution, depth = 0) => {
      chain.push({ ...contribution, depth });
      const children = contributions.filter(c => c.parentContributionId === contribution.id);
      children.forEach(child => buildChain(child, depth + 1));
    };
    
    buildChain(current);
    return chain;
  },

  updateResonance: (contributionId, increment = 1) => {
    const contributions = storageUtils.getContributions();
    const contribution = contributions.find(c => c.id === contributionId);
    if (contribution) {
      contribution.resonance = Math.max(0, contribution.resonance + increment);
      storageUtils.saveContributions(contributions);
    }
    return contribution;
  }
};

// Generate some sample data
export const generateSampleData = () => {
  const sampleContributions = [
    new Contribution({
      contributor: "alice.eth",
      projectId: "farcaster-frames-toolkit",
      type: CONTRIBUTION_TYPES.EDIT,
      description: "Fixed TypeScript type definitions for Frame metadata",
      tags: ["typescript", "bugfix"],
      resonance: 12
    }),
    new Contribution({
      contributor: "bob.fc",
      projectId: "farcaster-frames-toolkit", 
      type: CONTRIBUTION_TYPES.COMMENT,
      description: "Great fix! This resolves the build issues we were having.",
      parentContributionId: null, // Will be set after first contribution is created
      resonance: 3
    }),
    new Contribution({
      contributor: "charlie.cast",
      projectId: "social-feed-widget",
      type: CONTRIBUTION_TYPES.REMIX,
      description: "Created a dark mode variant with improved accessibility",
      tags: ["ui", "accessibility", "dark-mode"],
      resonance: 8
    }),
    new Contribution({
      contributor: "diana.dev",
      projectId: "farcaster-analytics",
      type: CONTRIBUTION_TYPES.SUGGESTION,
      description: "Could we add support for custom time ranges in the analytics dashboard?",
      tags: ["feature-request", "analytics"],
      resonance: 5
    }),
    new Contribution({
      contributor: "eve.builder",
      projectId: "social-feed-widget",
      type: CONTRIBUTION_TYPES.REMIX,
      description: "Extended Charlie's dark mode with animated transitions",
      parentContributionId: null, // Will be set to charlie's contribution
      tags: ["ui", "animations"],
      resonance: 15
    })
  ];

  // Set up parent-child relationships
  const contributions = storageUtils.getContributions();
  if (contributions.length === 0) {
    // Add first contribution
    const firstContrib = storageUtils.addContribution(sampleContributions[0]);
    
    // Add comment as child of first contribution
    sampleContributions[1].parentContributionId = firstContrib.id;
    storageUtils.addContribution(sampleContributions[1]);
    
    // Add third contribution
    const thirdContrib = storageUtils.addContribution(sampleContributions[2]);
    
    // Add other contributions
    storageUtils.addContribution(sampleContributions[3]);
    
    // Add remix as child of third contribution
    sampleContributions[4].parentContributionId = thirdContrib.id;
    storageUtils.addContribution(sampleContributions[4]);
  }
};
