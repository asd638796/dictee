// src/components/Sidebar.tsx
import React from 'react';

interface Note {
  id: string;
  body: string;
}

interface SidebarProps {
  notes: Note[];
  currentNote: Note | undefined;
  setCurrentNoteId: (id: string) => void;
  newNote: () => void;
  deleteNote: (id: string) => void;
}

const Sidebar = ({ notes, currentNote, setCurrentNoteId, newNote, deleteNote }: SidebarProps): React.JSX.Element => {
  return (
    <div className="sidebar">
      <button onClick={newNote}>New Note</button>
      {notes.map(note => (
        <div key={note.id} onClick={() => setCurrentNoteId(note.id)}>
          <p>{note.body.split('\n')[0]}</p>
          <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
