// src/App.tsx
import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Body from './components/Body';
import { nanoid } from 'nanoid';
import './index.css';

interface Note {
  id: string;
  body: string;
}

const App = (): React.JSX.Element => {
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem('notes') || '[]'));
  const [currentNoteId, setCurrentNoteId] = useState<string>((notes[0] && notes[0].id) || '');

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  function createNewNote(): void {
    const newNote: Note = {
      id: nanoid(),
      body: "# Type your markdown note's title here"
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setCurrentNoteId(newNote.id);
  }

  function updateNote(text: string): void {
    setNotes((oldNotes) => {
      const newArray = oldNotes.map((note) => {
        if (note.id === currentNoteId) {
          return { ...note, body: text };
        }
        return note;
      });
      return [newArray.find(note => note.id === currentNoteId)!, ...newArray.filter(note => note.id !== currentNoteId)];
    });
  }

  function findCurrentNote(): Note | undefined {
    return notes.find(note => note.id === currentNoteId);
  }

  function deleteNote(noteId: string): void {
    setNotes((oldNotes) => oldNotes.filter(note => note.id !== noteId));
    if (currentNoteId === noteId) {
      setCurrentNoteId(notes[0]?.id || '');
    }
  }

  return (
    <div className="app">
      <div className="sidebar-container">
        <Sidebar
          notes={notes}
          currentNote={findCurrentNote()}
          setCurrentNoteId={setCurrentNoteId}
          newNote={createNewNote}
          deleteNote={deleteNote}
        />
      </div>
      <div className="body-container">
        {currentNoteId && notes.length > 0 && (
          <Body currentNote={findCurrentNote()} updateNote={updateNote} />
        )}
      </div>
    </div>
  );
};

export default App;
