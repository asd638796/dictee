import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Note {
  id: string;
  title: string;
  body: string;
}

interface BodyProps {
  currentNote: Note | undefined;
  updateNoteTitle: (text: string) => void;
  updateNoteBody: (text: string) => void;
}



const Body = ({ currentNote, updateNoteTitle, updateNoteBody }: BodyProps): React.JSX.Element => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popup, setPopup] = useState<{ visible: boolean, word: string, x: number, y: number }>({ visible: false, word: '', x: 0, y: 0 });
  const [definition, setDefinition] = useState<string>('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function fetchDefinition(word: string) {
    try {
      const response = await fetch(`http://localhost:5000/api/definition?word=${word}`);
      const data = await response.json();
      if (response.ok) {
        setDefinition(data[0]?.meanings[0]?.definitions[0]?.definition || 'No definition found');
      } else {
        setDefinition('No definition found');
      }
    } catch (error) {
      setDefinition('Error fetching definition');
    }
  }


  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateNoteTitle(event.target.value);
  }

  function handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    updateNoteBody(event.target.value);
  }

  function handleTextClick(event: React.MouseEvent<HTMLTextAreaElement>) {
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPosition = textarea.selectionStart;
    const text = textarea.value;

    const word = extractWordAtPosition(text, cursorPosition);
    if (word) {
      const rect = textarea.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPopup((prevPopup) => {
        if (prevPopup.visible && prevPopup.word === word) {
          return { visible: false, word: '', x: 0, y: 0 };
        }
        fetchDefinition(word);
        return { visible: true, word, x, y };
      });
    } else {
      setPopup({ visible: false, word: '', x: 0, y: 0 });
    }
  }

  function extractWordAtPosition(text: string, position: number): string {
    const left = text.slice(0, position).split(/\s+/).pop();
    const right = text.slice(position).split(/\s+/).shift();
    const word = (left || '') + (right || '');
    return word.trim().length > 0 ? word : '';
  }

  function handleLogout() {
    
    logout();
    navigate('/login');
  }



  async function playTTS(text: string) {
    const response = await fetch('http://localhost:5000/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }

  function handleDictateClick() {
    if (currentNote?.body) {
      playTTS(currentNote.body);
    }
  }

  function handleWordDictateClick() {
    if (popup.word) {
      playTTS(popup.word);
    }
  }

  

  return (
    <div className="body">
      <div className='header-body'>
        <input
          className="title"
          type="text"
          value={currentNote?.title || ''}
          onChange={handleTitleChange}
          placeholder="Title"
        />
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <div className="textarea-container">
        <textarea
          className="body-text"
          ref={textareaRef}
          value={currentNote?.body || ''}
          onChange={handleBodyChange}
          onClick={handleTextClick}
          placeholder="Type your text here"
        />
        <button className="dictate-button" onClick={handleDictateClick}>
          Dictate
        </button>
        {popup.visible && (
          <div className="popup" style={{ top: popup.y, left: popup.x }}>
            <h1>{popup.word}</h1>
            <p className='popup-definition'>{definition}</p>
            <button className="popup-button"onClick={handleWordDictateClick}>Dictate</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Body;
