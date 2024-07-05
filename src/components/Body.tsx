// src/components/Body.tsx
import React from 'react';

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
  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateNoteTitle(event.target.value);
  }

  function handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    updateNoteBody(event.target.value);
    
  }

  return (
    <div className="body">
      <input className = "title"
        type="text"
        value={currentNote?.title || ''}
        onChange={handleTitleChange}
        placeholder="Title"
      />
      <textarea className="body-text"
        value={currentNote?.body || ''}
        onChange={handleBodyChange}
        placeholder="Type your text here"
      />
    </div>
  );
};

export default Body;
