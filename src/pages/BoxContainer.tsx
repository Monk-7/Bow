import React, { useState,useRef } from "react";
import axios from 'axios';
interface Box {
  id: number;
  position: { x: number; y: number };
  size: { width: number; height: number, z: number};
  rotate : boolean;
}

const BoxContainer: React.FC = () => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [boxeWidth, setBoxeWidth] = useState(50);
  const [boxeHeight, setBoxeHeight] = useState(50);
  const [boxeZ, setBoxeZ] = useState(0);
  const [containerWidth, setContainerWidth] = useState(500);
  const [containerHeight, setContainerHeight] = useState(500);

  const sendForm = async () =>{
    const form = boxes.map((box) => ({
      ...box,
      position: {
        ...(box.rotate
          ? { x: (box.position.x + (box.size.height / 2)), y: (box.position.x + (box.size.width / 2)) }
          : { x: (box.position.x + (box.size.width / 2)), y: (box.position.x + (box.size.height / 2)) }
        ),
      }
    }));
    // console.log(form)
    // console.log(form.map((box) => box.position))
    // console.log(form.map((box) => box.rotate))
    // console.log(form.length)
    
    
    const user = JSON.stringify({
      
      position : form.map((box) => box.position),
      rotate : form.map((box) => box.rotate),
      size : form.map((box) => box.size),
      index : form.length
    });

    console.log(user)

    const url = 'https://localhost:7163/User';
    
    const headers = {
      'Content-Type': 'application/json',
    };

    axios.post(url, user, { headers })
    .then((response) => {
      console.log('Response:', response.data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    boxId: number
  ) => {
    const { clientX, clientY } = event;
    const box = boxes.find((b) => b.id === boxId);
    if (!box) return;
    setDragOffset({
      x: clientX - box.position.x,
      y: clientY - box.position.y
    });
    setIsDragging(true);
    setSelectedBoxId(boxId);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
    boxId: number
  ) => {
    if (!isDragging || selectedBoxId !== boxId) return;
    const { clientX, clientY } = event;
    const boxIndex = boxes.findIndex((b) => b.id === boxId);
    if (boxIndex === -1) return;
    const box = boxes[boxIndex];
    const nextX = clientX - dragOffset.x;
    const nextY = clientY - dragOffset.y;

    // กำหนดขอบเขตของกล่องให้อยู่ภายใน Container
    const minX = 0;
    const minY = 0;
    const maxX = containerWidth - box.size.width;
    const maxY = containerHeight - box.size.height;

    const boundedX = Math.max(minX, Math.min(nextX, maxX));
    const boundedY = Math.max(minY, Math.min(nextY, maxY));

    const updatedBoxes = [...boxes];
    updatedBoxes[boxIndex] = {
      ...box,
      position: { x: boundedX, y: boundedY }
    };
    setBoxes(updatedBoxes);
  };

  const handleAddBox = (rotate:boolean) => {
    const newBoxId = boxes.length + 1;
    if (rotate)
    {
      const newBox: Box = {
        id: newBoxId,
        position: { x: 0, y: 0 },
        size: { width: boxeHeight, height: boxeWidth, z: boxeZ },
        rotate : true
      };
      setBoxes([...boxes, newBox]);
    }
    else {
      const newBox: Box = {
        id: newBoxId,
        position: { x: 0, y: 0 },
        size: { width: boxeWidth, height: boxeHeight, z: boxeZ },
        rotate : false
      };
      setBoxes([...boxes, newBox]);
    }
  };

  const handleDeleteSelectedBox = () => {
    if (selectedBoxId !== null) {
      const updatedBoxes = boxes.filter((box) => box.id !== selectedBoxId);
      setBoxes(updatedBoxes);
      setSelectedBoxId(null);
    }
  };

  const handleGlobalSizeChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
        global_width : {value: string};
        global_height: {value: string};
        global_z : {value: string};
    };
    const newSizeWidth = parseInt(target.global_width.value);
    const newSizeHeight = parseInt(target.global_height.value);
    const newSizeZ = parseInt(target.global_z.value);
    if (isNaN(newSizeWidth) || isNaN(newSizeHeight)) return;
    setBoxeWidth(newSizeWidth);
    setBoxeHeight(newSizeHeight);
    setBoxeZ(newSizeZ);
    console.log(boxeWidth);
    console.log(boxeHeight);

    const updatedBoxes = boxes.map((box) => ({
      ...box,
      size: {
        ...(box.rotate
          ? { width: newSizeHeight, height: newSizeWidth, z: newSizeZ }
          : { width: newSizeWidth, height: newSizeHeight, z: newSizeZ }
        ),
      }
    }));
    setBoxes(updatedBoxes);
  };
  const handleContainerSize = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
        container_width : {value: string};
        container_height: {value: string};
    };
      setContainerWidth(parseInt(target.container_width.value));
      setContainerHeight(parseInt(target.container_height.value));
  };
  return (
    <div>
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          border: "1px solid black",
          position: "relative"
        }}
      >
        {boxes.map((box) => (
          <div
            key={box.id}
            style={{
              width: box.size.width,
              height: box.size.height,
              backgroundColor: selectedBoxId === box.id ? "blue" : "red",
              position: "absolute",
              top: `${box.position.y}px`,
              left: `${box.position.x}px`,
              cursor: isDragging ? "grabbing" : "grab"
            }}
            onMouseDown={(event) => handleMouseDown(event, box.id)}
            onMouseUp={handleMouseUp}
            onMouseMove={(event) => handleMouseMove(event, box.id)}
          >
            Box {box.id}
          </div>
        ))}
      </div>
      <button onClick={() => {handleAddBox(false)}}>Add Box</button>
      <button onClick={() => {handleAddBox(true)}}>Add Box Rotate</button>
      <button onClick={handleDeleteSelectedBox}>Delete SelectedBox</button> 
      <button onClick={sendForm}>Console</button> 
        <form onSubmit={(event) => {handleGlobalSizeChange(event);}}>
            <label htmlFor={`global_width`}>Width: </label>
            <input
                type="text"
                id={`global_width`}
            />
            <label htmlFor={`global_height`}>Height: </label>
            <input
                type="text"
                id={`global_height`}
            />
            <br />
            <label htmlFor={`global_z`}>Z: </label>
            <input
                type="text"
                id={`global_z`}
            />
            <button type="submit">Set Size Box</button>
        </form>
        <form onSubmit={(event) => {handleContainerSize(event);}}>
            <h4>Adjust Container Size</h4>
            <label htmlFor="container-width">Width:</label>
            <input
                type="text"
                id="container_width"
            />
            <label htmlFor="container-height">Height:</label>
            <input
                type="text"
                id="container_height"
            />
            <button type="submit">Apply</button>
      </form>
    </div>
    
  );
};

export default BoxContainer;
