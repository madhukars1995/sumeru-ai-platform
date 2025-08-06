import React, { useState } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  actionHandler: () => void;
}

interface OnboardingGuideProps {
  onComplete?: () => void;
  onAction?: (action: string) => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete, onAction }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your AI Workspace',
      description: 'Let\'s get you started with the essential features of your AI-powered development environment.',
      icon: '🎉',
      action: 'Get Started',
      actionHandler: () => setCurrentStep(1)
    },
    {
      id: 'chat',
      title: 'Start a Conversation',
      description: 'Use the chat panel on the left to interact with AI agents. Select an agent and start chatting!',
      icon: '💬',
      action: 'Open Agent Selector',
      actionHandler: () => {
        setCompletedSteps(prev => new Set([...prev, 'chat']));
        onAction?.('agents');
        setCurrentStep(2);
      }
    },
    {
      id: 'projects',
      title: 'Create Your First Project',
      description: 'Use MetaGPT to create AI-powered projects. Define requirements and let AI agents work together.',
      icon: '🚀',
      action: 'Open MetaGPT',
      actionHandler: () => {
        setCompletedSteps(prev => new Set([...prev, 'projects']));
        onAction?.('metagpt');
        setCurrentStep(3);
      }
    },
    {
      id: 'files',
      title: 'Manage Your Files',
      description: 'Upload, create, and organize your project files. Everything is version-controlled and accessible.',
      icon: '📁',
      action: 'Open File Manager',
      actionHandler: () => {
        setCompletedSteps(prev => new Set([...prev, 'files']));
        onAction?.('folder');
        setCurrentStep(4);
      }
    },
    {
      id: 'analytics',
      title: 'Monitor Progress',
      description: 'Track your team\'s productivity, AI usage, and project metrics in real-time.',
      icon: '📊',
      action: 'View Analytics',
      actionHandler: () => {
        setCompletedSteps(prev => new Set([...prev, 'analytics']));
        onAction?.('analytics');
        setCurrentStep(5);
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You\'ve explored the key features. Start building amazing projects with AI assistance!',
      icon: '🎯',
      action: 'Start Building',
      actionHandler: () => {
        onComplete?.();
      }
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="h-full bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm text-slate-400">{currentStep + 1} of {steps.length}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{currentStepData.icon}</div>
          <h1 className="text-3xl font-bold text-slate-200 mb-4">
            {currentStepData.title}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {currentStepData.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={currentStepData.actionHandler}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {currentStepData.action}
          </button>
          
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="px-6 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-900/20'
                  : completedSteps.has(step.id)
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-slate-600 bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{step.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-200">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
                {completedSteps.has(step.id) && (
                  <div className="text-green-400">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-8">
          <button
            onClick={() => onComplete?.()}
            className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  );
}; 