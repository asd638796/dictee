// src/App.tsx
import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Body from './components/Body';
import { nanoid } from 'nanoid';
import './index.css';

interface Note {
  id: string;
  title: string;
  body: string;
}

const App = (): React.JSX.Element => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    return savedNotes.length > 0 ? savedNotes : [createInitialNote()];
  });
  const [currentNoteId, setCurrentNoteId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (notes.length > 0 && !notes.find(note => note.id === currentNoteId)) {
      setCurrentNoteId(notes[0].id);
    }
  }, [notes, currentNoteId]);

  function createInitialNote(): Note {
    return {
      id: nanoid(),
      title: "New Note Title",
      body: ""
    };
  }

  function createNewNote(): void {
    const newNote: Note = createInitialNote();
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setCurrentNoteId(newNote.id);
  }

  function updateNoteTitle(title: string): void {
    setNotes((oldNotes) => {
      const newArray = oldNotes.map((note) => {
        if (note.id === currentNoteId) {
          return { ...note, title };
        }
        return note;
      });
      return [newArray.find(note => note.id === currentNoteId)!, ...newArray.filter(note => note.id !== currentNoteId)];
    });
  }

  function updateNoteBody(body: string): void {
    setNotes((oldNotes) => {
      const newArray = oldNotes.map((note) => {
        if (note.id === currentNoteId) {
          return { ...note, body };
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
    if (notes.length > 1) {
      setNotes((oldNotes) => oldNotes.filter(note => note.id !== noteId));
      if (currentNoteId === noteId) {
        setCurrentNoteId(notes[0]?.id || '');
      }
    } else {
      const newNote = createInitialNote();
      setNotes([newNote]);
      setCurrentNoteId(newNote.id);
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
          <Body
            currentNote={findCurrentNote()}
            updateNoteTitle={updateNoteTitle}
            updateNoteBody={updateNoteBody}
          />
        )}
      </div>
    </div>
  );
};

export default App;
