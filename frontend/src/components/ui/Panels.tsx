import React from 'react';
import type { PanelID } from './UtilityRail';
import { TerminalPane } from '../../panes/TerminalPane';
import { PlannerPane } from '../../panes/PlannerPane';
import { AppViewerPane } from '../../panes/AppViewerPane';
import { EditorPane } from '../../panes/EditorPane';
import { FilePane } from '../../panes/FilePane';

interface Props {
  active: PanelID;
  setActive: (p: PanelID) => void;
}

export const Panels = ({ active, setActive }: Props) => {
  if (!active) return null;            // nothing selected

  const panes = {
    terminal: TerminalPane,
    planner: PlannerPane,
    app: AppViewerPane,
    editor: EditorPane,
    files: FilePane,
  } as const;

  const Pane = panes[active];

  return (
    <section className="flex-1 overflow-hidden">
      <Pane onClose={() => setActive(null)} />
    </section>
  );
}; 