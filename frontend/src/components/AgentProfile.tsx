import React, { useState, useEffect } from 'react';

interface AgentProfileProps {
  agentRole: string;
  onClose: () => void;
}

interface Profile {
  name: string;
  role: string;
  avatar: string;
  title: string;
  experience: string;
  specialties: string[];
  skills: string[];
  education: string;
  certifications: string[];
  languages: string[];
  timezone: string;
  availability: string;
  portfolio: Array<{ project: string; impact: string }>;
  performance_metrics: {
    tasks_completed: number;
    success_rate: number;
    avg_completion_time: string;
    collaboration_score: number;
  };
}

const AgentProfile: React.FC<AgentProfileProps> = ({ agentRole, onClose }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/metagpt/agent-profile/${agentRole}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [agentRole]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading agent profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{profile.avatar}</div>
            <div>
              <h1 className="text-3xl font-bold text-slate-200">{profile.name}</h1>
              <p className="text-xl text-slate-400">{profile.title}</p>
              <p className="text-slate-500">{profile.experience} experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact & Availability */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-200">Contact & Availability</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Timezone:</span>
                  <span className="font-medium text-slate-200">{profile.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Availability:</span>
                  <span className="font-medium text-slate-200">{profile.availability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Languages:</span>
                  <span className="font-medium text-slate-200">{profile.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Education & Certifications */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-200">Education & Certifications</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Education</p>
                  <p className="font-medium text-slate-200">{profile.education}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Certifications</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-200">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Tasks Completed:</span>
                  <span className="font-medium text-slate-200">{profile.performance_metrics.tasks_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Success Rate:</span>
                  <span className="font-medium text-slate-200">{profile.performance_metrics.success_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Avg Completion Time:</span>
                  <span className="font-medium text-slate-200">{profile.performance_metrics.avg_completion_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Collaboration Score:</span>
                  <span className="font-medium text-slate-200">{profile.performance_metrics.collaboration_score}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Skills & Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specialties */}
            <div className="bg-blue-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-200">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-700 text-blue-200 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-green-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-green-200">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-700 text-green-200 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-purple-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-purple-200">Portfolio Highlights</h3>
              <div className="space-y-3">
                {profile.portfolio.map((item, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-3 border border-purple-700">
                    <h4 className="font-semibold text-purple-200">{item.project}</h4>
                    <p className="text-sm text-purple-300">{item.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // TODO: Implement assign task functionality
              console.log('Assign task to', profile.name);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile; 