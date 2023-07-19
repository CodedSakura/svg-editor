import React, { useCallback, useState } from "react";

enum DragModalState {
  OFF = "auto",
  RESIZE_BOTTOM = "ns-resize"
}

enum Tool {
  CURSOR,
  LINE,
  ARC,
  BEZIER,
  MOVE,
  ZOOM,
}

enum PropertyPanel {
  NONE,
  NEW,
  PATHS,
  PATH_PROPS,
}

export default function App() {
  const [ size, setSize ] = useState([ 16, 16 ]);
  const [ bottomHeight, setBottomHeight ] = useState(200);
  const [ dragModal, setDragModal ] = useState(DragModalState.OFF);
  const [ lightMode, setLightMode ] = useState(false);
  const [ tool, setTool ] = useState(Tool.CURSOR);
  const [ propertyPanel, setPropertyPanel ] = useState(PropertyPanel.NONE);

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
      <div
            className={tool === Tool.CURSOR ? "active" : undefined}
            onClick={() => setTool(Tool.CURSOR)}>Cursor</div>
      <hr />
      <div
            className={tool === Tool.LINE ? "active" : undefined}
            onClick={() => setTool(Tool.LINE)}>Line</div>
      <div
            className={tool === Tool.ARC ? "active" : undefined}
            onClick={() => setTool(Tool.ARC)}>Arc</div>
      <div
            className={tool === Tool.BEZIER ? "active" : undefined}
            onClick={() => setTool(Tool.BEZIER)}>Bezier</div>
      <hr />
      <div
            className={tool === Tool.MOVE ? "active" : undefined}
            onClick={() => setTool(Tool.MOVE)}>Move</div>
      <div
            className={tool === Tool.ZOOM ? "active" : undefined}
            onClick={() => setTool(Tool.ZOOM)}>Zoom</div>
    </div>
    <svg width="100%" height="100%" className={lightMode ? "light" : undefined}>
      <pattern id="grid" x={-5} y={-5} viewBox="0 0 10 10" width={10} height={10} patternUnits="userSpaceOnUse" stroke="#8888">
        <line x1={0} x2={10} strokeWidth={1} />
        <line y1={0} y2={10} strokeWidth={1} />
      </pattern>
      <rect fill="url(#grid)" width="200%" height="200%" />
    </svg>
    <div className="sidebar">
      <div>New</div>
      <div>Paths</div>
      <div>Path properties</div>
      <hr />
      <div
            className={lightMode ? "active" : undefined}
            onClick={() => setLightMode(v => !v)}>Light</div>
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
