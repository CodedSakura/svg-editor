import React, { useCallback, useState } from "react";

enum DragModalState {
  OFF = "auto",
  RESIZE_BOTTOM = "ns-resize"
}

export default function App() {
  const [ size, setSize ] = useState([ 16, 16 ]);
  const [ bottomHeight, setBottomHeight ] = useState(200);
  const [ dragModal, setDragModal ] = useState(DragModalState.OFF);

  const dragModalMove = useCallback((e: React.MouseEvent) => {
    if (dragModal === DragModalState.OFF) {
      return;
    }
    e.preventDefault();

    if (dragModal === DragModalState.RESIZE_BOTTOM) {
      setBottomHeight(window.innerHeight - e.pageY);
      return;
    }
  }, [ dragModal ]);

  return <>
    <div id="menubar">
      <div>
        Select size:
        <input
              type="number"
              min={0}
              value={size[0]}
              onChange={({ target: { value }}) => setSize([ Number(value), size[1] ])}
              placeholder="width" />
        <input
              type="number"
              min={0}
              value={size[1]}
              onChange={({ target: { value }}) => setSize([ size[0], Number(value) ])}
              placeholder="height" />
        <button>Create</button>
      </div>
    </div>

    <div className="sidebar">
      <div>A</div>
      <div>B</div>
      <div>C</div>
    </div>
    <svg width="100%" height="100%">
      <pattern id="p1" x={-5} y={-5} viewBox="0 0 10 10" width={10} height={10} patternUnits="userSpaceOnUse">
        <line x1={0} x2={10} stroke="#8888" strokeWidth={1} />
        <line y1={0} y2={10} stroke="#8888" strokeWidth={1} />
      </pattern>
      <rect fill="url(#p1)" width="200%" height="200%" />
    </svg>
    <div className="sidebar">
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </div>
    <div id="size-adjust" onMouseDown={() => setDragModal(DragModalState.RESIZE_BOTTOM)}></div>
    <div className="sidebar">
      <div>Q</div>
      <div>W</div>
      <div>E</div>
    </div>
    <div className="textarea" style={{ height: bottomHeight }}>Textarea</div>
    <div className="sidebar">
      <div>A</div>
      <div>S</div>
      <div>D</div>
    </div>
    <div id="modals">
      { dragModal !== DragModalState.OFF ? <div
            style={{ cursor: dragModal }}
            onMouseUp={() => setDragModal(DragModalState.OFF)}
            onMouseMove={dragModalMove} /> : null }
    </div>
  </>
}
