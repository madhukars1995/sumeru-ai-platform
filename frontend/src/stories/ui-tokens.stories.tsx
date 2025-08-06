import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/UI Tokens',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

// Header Gradient Story
export const HeaderGradient: Story = {
  render: () => (
    <div className="w-full">
      <header className="h-12 w-full bg-header-grad border-b border-slate-700 flex items-center px-4">
        <span className="text-white">Header with gradient</span>
      </header>
    </div>
  ),
};

// Body Gradient Story
export const BodyGradient: Story = {
  render: () => (
    <div className="w-96 h-64 bg-body-grad rounded-lg border border-slate-700 flex items-center justify-center">
      <span className="text-white">Body gradient background</span>
    </div>
  ),
};

// Panel Gradient Story
export const PanelGradient: Story = {
  render: () => (
    <div className="w-80 h-64 bg-panel-grad rounded-lg border border-slate-700 flex items-center justify-center">
      <span className="text-white">Panel gradient background</span>
    </div>
  ),
};

// Utility Rail Active State Story
export const UtilityRailActive: Story = {
  render: () => (
    <div className="w-12 h-64 bg-slate-900 border border-slate-700 rounded-lg flex flex-col items-center py-4">
      <button
        data-active="true"
        className="w-8 h-8 rounded mb-2 flex items-center justify-center text-sm bg-primary-600 text-white relative"
        title="Active Terminal"
      >
        💻
        <div className="absolute inset-0 rounded bg-primary-600/20 animate-pulse" />
      </button>
      <button
        className="w-8 h-8 rounded mb-2 flex items-center justify-center text-sm text-slate-300 hover:text-white hover:bg-slate-700/40"
        title="Inactive Planner"
      >
        📋
      </button>
    </div>
  ),
};

// Button States Story
export const ButtonStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
          Primary Active
        </button>
        <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 hover:text-white">
          Secondary Active
        </button>
      </div>
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-slate-700 text-slate-400 rounded cursor-not-allowed" disabled>
          Primary Disabled
        </button>
        <button className="px-4 py-2 bg-slate-700/60 text-slate-400 rounded cursor-not-allowed" disabled>
          Secondary Disabled
        </button>
      </div>
    </div>
  ),
};

// Quota Bar Responsive Story
export const QuotaBarResponsive: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="w-96">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 text-xs text-slate-400 p-4 bg-slate-800 rounded">
          <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
            <span>Daily: 75/100</span>
            <span>Monthly: 850/1000</span>
          </div>
          <div className="flex-1 h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary-600" />
          </div>
        </div>
      </div>
      
      <div className="w-64">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 text-xs text-slate-400 p-4 bg-slate-800 rounded">
          <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
            <span>Daily: 75/100</span>
            <span>Monthly: 850/1000</span>
          </div>
          <div className="flex-1 h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary-600" />
          </div>
        </div>
      </div>
    </div>
  ),
}; 