import React, { useRef } from 'react';

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
      playTTS(word);
    }
  }

  function extractWordAtPosition(text: string, position: number): string {
    const left = text.slice(0, position).split(/\s+/).pop();
    const right = text.slice(position).split(/\s+/).shift();
    return (left || '') + (right || '');
  }

  async function playTTS(text: string) {
    const response = await fetch('http://localhost:5002/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }

  return (
    <div className="body">
      <input
        className="title"
        type="text"
        value={currentNote?.title || ''}
        onChange={handleTitleChange}
        placeholder="Title"
      />
      <textarea
        className="body-text"
        ref={textareaRef}
        value={currentNote?.body || ''}
        onChange={handleBodyChange}
        onClick={handleTextClick}
        placeholder="Type your text here"
      />
    </div>
  );
};

export default Body;
