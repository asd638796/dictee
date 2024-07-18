// src/App.tsx
import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Body from './components/Body';
import { nanoid } from 'nanoid';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './index.css';

interface Note {
  id: string;
  title: string;
  body: string;
}

const App = (): React.JSX.Element => {
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string>('');
  const { authenticated, logout } = useAuth();
  const navigate = useNavigate();

  

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    if (authenticated) {
      const fetchNotes = async () => {
        try {
          const response = await fetch('/api/notes', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const fetchedNotes = await response.json();
            setNotes(fetchedNotes);
            if (fetchedNotes.length > 0) {
              setCurrentNoteId(fetchedNotes[0].id);
            }
          } else {
            console.error('Failed to fetch notes');
          }
        } catch (error) {
          console.error('Error fetching notes', error);
        }
      };

      fetchNotes();
    }
  }, [authenticated]);

  useEffect(() => {
    if (notes.length > 0 && !notes.find(note => note.id === currentNoteId)) {
      setCurrentNoteId(notes[0].id);
    }
  }, [notes, currentNoteId]);



  const handleLogout = async () => {
    try {
      const csrfToken = getCookie('csrf_access_token');
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken // Include CSRF token in the request headers
        },
        body: JSON.stringify({ notes }),
        credentials: 'include'  // Important for sending cookies
      });

      if (response.ok) {
        logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        console.error('Error logging out', errorData);
        alert('Error logging out: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error logging out', error);
      alert('Error logging out');
    }
  };

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
            handleLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
};

export default App;
