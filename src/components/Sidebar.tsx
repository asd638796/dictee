// src/components/Sidebar.tsx
import React from 'react';

interface Note {
  id: string;
  title: string;
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
      <div className='header'>
        <button className='new-note' onClick={newNote}>New Note</button>
      </div>
      
      {notes.map(note => (
        <div 
          key={note.id}
          onClick={() => setCurrentNoteId(note.id)}
          className={`note ${note.id === currentNote?.id ? 'active' : ''}`}
        >
          <p>{note.title}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNote(note.id);
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
