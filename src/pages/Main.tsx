import React, { useEffect, useRef, useState } from 'react';

interface BoxProps {
  left: number;
  top: number;
  isVertical: boolean;
  isSelected?: boolean; // Add isSelected property
}


const Main: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBox, setSelectedBox] = useState<HTMLDivElement | null>(null);
  const [boxes, setBoxes] = useState<BoxProps[]>([]);
  const boxWidthRef = useRef<HTMLInputElement>(null);
  const boxHeightRef = useRef<HTMLInputElement>(null);
  const containerWidthRef = useRef<HTMLInputElement>(null);
  const containerHeightRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkOverlap();
  }, [boxes]);

  function calculateBoxCenter(box: HTMLDivElement): { x: number; y: number } {
    const boxRect = box.getBoundingClientRect();
    const centerX = boxRect.left + boxRect.width / 2;
    const centerY = boxRect.top + boxRect.height / 2;
    return { x: centerX, y: centerY };
  }

  function startDrag(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void {
    e.preventDefault();
    setIsDragging(true);
  
    const target = e.target as HTMLDivElement;
    const x = 'touches' in e ? e.touches[0].clientX - target.offsetLeft : e.clientX - target.offsetLeft;
    const y = 'touches' in e ? e.touches[0].clientY - target.offsetTop : e.clientY - target.offsetTop;
    setOffset({ x, y });
  }
  
  function drag(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void {
    e.preventDefault();
  
    if (isDragging) {
      const target = e.currentTarget as HTMLDivElement;
      const x = 'touches' in e ? e.touches[0].clientX - offset.x : e.clientX - offset.x;
      const y = 'touches' in e ? e.touches[0].clientY - offset.y : e.clientY - offset.y;
      moveBox(target, x, y);
    }
  }
  
  function moveBox(box: HTMLDivElement, x: number, y: number): void {
    const container = containerRef.current;
    if (!container) return;

    const maxX = container.clientWidth - box.offsetWidth;
    const maxY = container.clientHeight - box.offsetHeight;

    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));

    box.style.left = clampedX + 'px';
    box.style.top = clampedY + 'px';

    checkOverlap();
  }

  function stopDrag(): void {
    setIsDragging(false);
  }

  function setBoxSize(box: HTMLDivElement, isVertical: boolean): void {
    const widthInput = boxWidthRef.current;
    const heightInput = boxHeightRef.current;
  
    if (!widthInput || !heightInput) return;
  
    const width = parseInt(widthInput.value) / 5;
    const height = parseInt(heightInput.value) / 5;
  
    if (!isNaN(width) && !isNaN(height)) {
      const boxWidth = `${parseInt(String(width))}px`; // Convert to string
      const boxHeight = `${parseInt(String(height))}px`; // Convert to string
  
      box.style.width = isVertical ? boxHeight : boxWidth;
      box.style.height = isVertical ? boxWidth : boxHeight;
    } else {
      alert('กรุณากรอกขนาดเป็นตัวเลข');
    }
  }
  
  function createBox(x: number, y: number, isVertical: boolean): void {
    const container = containerRef.current;
    if (!container) return;

    const availableSpace = findAvailableSpace(x, y);

    if (availableSpace) {
      const newBox: BoxProps = {
        left: availableSpace.x,
        top: availableSpace.y,
        isVertical,
      };
      setBoxes((prevBoxes) => [...prevBoxes, newBox]);
    } else {
      alert('ไม่พบพื้นที่ว่างสำหรับกล่องใหม่');
    }
  }

  function deleteBox(box: BoxProps): void {
    setBoxes((prevBoxes) => prevBoxes.filter((prevBox) => prevBox !== box));
  }

  function deleteSelectedBoxes(): void {
    setBoxes((prevBoxes) => prevBoxes.filter((prevBox) => !prevBox.isSelected));
  }

  function checkOverlap(): void {
    const updatedBoxes = [...boxes];

    for (let i = 0; i < updatedBoxes.length; i++) {
      for (let j = i + 1; j < updatedBoxes.length; j++) {
        const boxA = updatedBoxes[i];
        const boxB = updatedBoxes[j];

        if (
          boxA.left < boxB.left + 100 &&
          boxA.left + 100 > boxB.left &&
          boxA.top < boxB.top + 100 &&
          boxA.top + 100 > boxB.top
        ) {
          boxA.isSelected = true;
          boxB.isSelected = true;
        } else {
          delete boxA.isSelected;
          delete boxB.isSelected;
        }
      }
    }

    setBoxes(updatedBoxes);
  }

  function resizeContainer(width: number, height: number): void {
    const container = containerRef.current;
    if (!container) return;
  
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
  }
  
  function setContainerSize(): void {
    const widthInput = containerWidthRef.current;
    const heightInput = containerHeightRef.current;
  
    if (!widthInput || !heightInput) return;
  
    const width = parseInt(widthInput.value) / 5;
    const height = parseInt(heightInput.value) / 5;
  
    if (!isNaN(width) && !isNaN(height)) {
      resizeContainer(width, height); // Convert width and height to strings
    } else {
      alert('กรุณากรอกขนาดเป็นตัวเลข');
    }
  }
  

  function findAvailableSpace(x: number, y: number): { x: number; y: number } | null {
    const container = containerRef.current;
    if (!container) return null;

    const newBoxWidthInput = boxWidthRef.current;
    const newBoxHeightInput = boxHeightRef.current;

    if (!newBoxWidthInput || !newBoxHeightInput) return null;

    const newBoxWidth = parseInt(newBoxWidthInput.value) / 5;
    const newBoxHeight = parseInt(newBoxHeightInput.value) / 5;

    const newBoxRect = {
      left: x,
      top: y,
      width: newBoxWidth,
      height: newBoxHeight,
    };

    for (let x = 0; x <= container.clientWidth; x += 10) {
      for (let y = 0; y <= container.clientHeight; y += 10) {
        const available = isSpaceAvailable(x, y, newBoxRect);
        if (available) {
          return { x, y };
        }
      }
    }

    return null;
  }

  function isSpaceAvailable(x: number, y: number, newBox: { left: number; top: number; width: number; height: number }): boolean {
    for (let i = 0; i < boxes.length; i++) {
      const existingBox = boxes[i];
      const existingBoxRect = {
        left: existingBox.left,
        top: existingBox.top,
        width: existingBox.isVertical ? existingBox.top + 20 : existingBox.left + 20,
        height: existingBox.isVertical ? existingBox.left + 20 : existingBox.top + 20,
      };

      if (
        x + newBox.width > existingBoxRect.left &&
        x < existingBoxRect.left + existingBoxRect.width &&
        y + newBox.height > existingBoxRect.top &&
        y < existingBoxRect.top + existingBoxRect.height
      ) {
        return false;
      }
    }

    return true;
  }

  return (
    <div>
      <div ref={containerRef} style={{ width: '500px', height: '500px', border: '1px solid black', position: 'relative', overflow: 'hidden' }}>
        {boxes.map((box, index) => (
          <div
            key={index}
            className={`box${box.isSelected ? ' selected' : ''}`}
            style={{
              left: `${box.left}px`,
              top: `${box.top}px`,
              width: box.isVertical ? '20px' : '100px',
              height: box.isVertical ? '100px' : '20px',
              backgroundColor: box.isSelected ? 'red' : '#ccc',
              position: 'absolute',
              cursor: 'move',
              border: '1px solid black',
            }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            onMouseMove={drag}
            onTouchMove={drag}
            onMouseUp={stopDrag}
            onTouchEnd={stopDrag}
            onClick={(event) => {
              if (event.shiftKey) {
                const updatedBoxes = [...boxes];
                updatedBoxes[index].isSelected = !updatedBoxes[index].isSelected;
                setBoxes(updatedBoxes);
              } else {
                if (selectedBox && selectedBox !== event.target) {
                  const updatedBoxes = [...boxes];
                  delete updatedBoxes[index].isSelected;
                  setBoxes(updatedBoxes);
                }
                const updatedBoxes = [...boxes];
                updatedBoxes[index].isSelected = !updatedBoxes[index].isSelected;
                setBoxes(updatedBoxes);
                setSelectedBox(event.target as HTMLDivElement);
              }
            }}
          />
        ))}
      </div>
      <div>
        <label htmlFor="width-input">ความกว้าง:</label>
        <input type="text" id="width-input" ref={boxWidthRef} /> mm <br />
      </div>
      <div>
        <label htmlFor="height-input">ความสูง:</label>
        <input type="text" id="height-input" ref={boxHeightRef} /> mm
      </div>
      <div>
        <button onClick={() => setBoxSize(selectedBox as HTMLDivElement, false)}>Enter</button>
        <button onClick={() => createBox(0, 0, false)}>เพิ่ม Box (แนวนอน)</button>
        <button onClick={() => createBox(0, 0, true)}>เพิ่ม Box (แนวตั้ง)</button>
        <button onClick={deleteSelectedBoxes}>ลบ Box ที่เลือก</button>
      </div>
      <div>
        <label htmlFor="container-width">ความกว้าง:</label>
        <input type="text" id="container-width" ref={containerWidthRef} /> mm
        <label htmlFor="container-height">ความสูง:</label>
        <input type="text" id="container-height" ref={containerHeightRef} /> mm <br />
        <button onClick={setContainerSize}>แก้ไขขนาด container</button>
      </div>
    </div>
  );
};

export default Main;
