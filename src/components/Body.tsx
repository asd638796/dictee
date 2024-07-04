// src/components/Body.tsx
import React from 'react';

interface Note {
  id: string;
  body: string;
}

interface BodyProps {
  currentNote: Note | undefined;
  updateNote: (text: string) => void;
}

const Body = ({ currentNote, updateNote }: BodyProps): React.JSX.Element => {
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    updateNote(event.target.value);
  }

  return (
    <div className="body">
      <textarea value={currentNote?.body || ''} onChange={handleChange} />
    </div>
  );
};

export default Body;
