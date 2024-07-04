
import React from 'react';

const Sidebar: React.FC = () => {
  const notes = ['Note 1', 'Note 2', 'Note 3']; 

  return (
    <div className="sidebar">
      <h2>Saved Notes</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
