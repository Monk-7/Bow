import React from 'react';
import BoxContainer from './BoxContainer';

const Main: React.FC = () => {
  return (
    <div>
      <h1>Draggable Box</h1>
      <div
        style={{
          width: "500px",
          height: "500px",
          border: "1px solid black",
          position: "relative"
        }}
      >
        <BoxContainer />
      </div>
    </div>
  );
};

export default Main;
