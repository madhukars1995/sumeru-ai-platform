import React, { useState, useMemo } from 'react';

const CategoryButton = React.memo(({ 
  category, 
  isActive, 
  onClick 
}: { 
  category: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button 
    className={`px-3 py-1.5 rounded text-sm transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-300 hover:text-white hover:bg-slate-700'
    }`} 
    onClick={onClick}
  >
    {category}
  </button>
));

const AppCardComponent = React.memo(({ 
  app, 
  onClick 
}: { 
  app: { icon: string; title: string; description: string; category: string }; 
  onClick: () => void;
}) => (
  <div 
    className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
    onClick={onClick}
  >
    <div className="text-2xl mb-3">{app.icon}</div>
    <h3 className="font-semibold text-slate-200 mb-2">{app.title}</h3>
    <p className="text-sm text-slate-400 mb-3">{app.description}</p>
    <span className="text-xs text-slate-500 uppercase tracking-wide">{app.category}</span>
  </div>
));

function AppWorldPage() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Memoized data
  const appCards = useMemo(() => [
    { icon: '🌐', title: 'Web Development', description: 'Create modern web applications with React, Vue, and more', category: 'Development' },
    { icon: '📱', title: 'Mobile Apps', description: 'Build iOS and Android apps with React Native and Flutter', category: 'Development' },
    { icon: '🤖', title: 'AI Integration', description: 'Add AI capabilities to your applications', category: 'AI' },
    { icon: '🎨', title: 'UI/UX Design', description: 'Create beautiful user interfaces and experiences', category: 'Design' },
    { icon: '📊', title: 'Data Analysis', description: 'Analyze and visualize data with Python and R', category: 'Analytics' },
    { icon: '🔒', title: 'Security', description: 'Implement security best practices and authentication', category: 'Security' }
  ], []);

  const categories = useMemo(() => ['All', 'Development', 'AI', 'Design', 'Analytics', 'Security'], []);

  // Memoized computations
  const filteredAppCards = useMemo(() => {
    return selectedCategory === 'All' ? appCards : appCards.filter(app => app.category === selectedCategory);
  }, [appCards, selectedCategory]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* App World Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-200">App World</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {categories.map((category) => (
                <CategoryButton
                  key={category}
                  category={category}
                  isActive={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
            <select 
              className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Productivity">Productivity</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Communication">Communication</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppCards.map((app, index) => (
            <AppCardComponent
              key={index}
              app={app}
              onClick={() => console.log(`App ${app.title} clicked`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AppWorldPage; 