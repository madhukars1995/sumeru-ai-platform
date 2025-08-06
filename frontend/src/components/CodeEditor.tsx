import React, { useState } from 'react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

export const CodeEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [fileContent, setFileContent] = useState<string>('');

  const fileTree: FileNode[] = [
    {
      id: 'root',
      name: 'project',
      type: 'folder',
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          children: [
            {
              id: 'components',
              name: 'components',
              type: 'folder',
              children: [
                {
                  id: 'App.tsx',
                  name: 'App.tsx',
                  type: 'file',
                  content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;`,
                  language: 'typescript'
                },
                {
                  id: 'ChatPage.tsx',
                  name: 'ChatPage.tsx',
                  type: 'file',
                  content: `import React from 'react';

export const ChatPage: React.FC = () => {
  return (
    <div>
      <h1>Chat Page</h1>
    </div>
  );
};`,
                  language: 'typescript'
                }
              ]
            },
            {
              id: 'index.tsx',
              name: 'index.tsx',
              type: 'file',
              content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
              language: 'typescript'
            }
          ]
        },
        {
          id: 'package.json',
          name: 'package.json',
          type: 'file',
          content: `{
  "name": "sumeru-ai-project",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`,
          language: 'json'
        },
        {
          id: 'README.md',
          name: 'README.md',
          type: 'file',
          content: `# Sumeru AI Project

This is a React application created with Sumeru AI.

## Getting Started

1. Install dependencies: \`npm install\`
2. Start development server: \`npm start\`
3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm test\` - Launches the test runner
- \`npm run eject\` - Ejects from Create React App

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).`,
          language: 'markdown'
        }
      ]
    }
  ];

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const selectFile = (fileId: string) => {
    setSelectedFile(fileId);
    const file = findFile(fileTree, fileId);
    if (file?.content) {
      setFileContent(file.content);
    }
  };

  const findFile = (nodes: FileNode[], fileId: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === fileId) {
        return node;
      }
      if (node.children) {
        const found = findFile(node.children, fileId);
        if (found) return found;
      }
    }
    return null;
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-slate-700 ${
            selectedFile === node.id ? 'bg-slate-600' : ''
          }`}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              selectFile(node.id);
            }
          }}
        >
          <span className="text-sm">
            {node.type === 'folder' ? '📁' : '📄'}
          </span>
          <span className="text-white text-sm">{node.name}</span>
          {node.type === 'folder' && (
            <span className="text-slate-400 text-xs">
              {expandedFolders.has(node.id) ? '▼' : '▶'}
            </span>
          )}
        </div>
        {node.type === 'folder' && node.children && expandedFolders.has(node.id) && (
          <div>
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* File Tree */}
      <div className="w-64 border-r border-slate-700 bg-slate-800">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-medium">Files</h3>
        </div>
        <div className="p-2">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{selectedFile}</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded bg-slate-700 text-white text-sm hover:bg-slate-600">
                    Save
                  </button>
                  <button className="px-3 py-1 rounded bg-slate-700 text-white text-sm hover:bg-slate-600">
                    Format
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full bg-slate-800 text-white border border-slate-600 rounded p-4 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                placeholder="Start coding..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="text-4xl mb-4">📄</div>
              <p>Select a file to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 