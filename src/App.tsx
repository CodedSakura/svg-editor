import * as classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";

enum DragModalState {
  OFF = "auto",
  RESIZE_BOTTOM = "ns-resize"
}

enum Tool {
  CURSOR,
  SQUARE,
  ELLIPSE,
  LINE,
  ARC,
  BEZIER,
  MOVE,
  ZOOM,
}

const toolList = [
  [
    Tool.SQUARE,
    Tool.ELLIPSE,
  ], [
    Tool.LINE,
    Tool.ARC,
    Tool.BEZIER,
  ], [
    Tool.CURSOR,
  ], [
    Tool.MOVE,
    Tool.ZOOM,
  ],
] as const;
const toolData: Record<Tool, { name: string, description?: string }> = {
  [Tool.CURSOR]: { name: "Cursor" },
  [Tool.SQUARE]: { name: "Square" },
  [Tool.ELLIPSE]: { name: "Ellipse" },
  [Tool.LINE]: { name: "Line" },
  [Tool.ARC]: { name: "Arc" },
  [Tool.BEZIER]: { name: "Bezier" },
  [Tool.MOVE]: { name: "Move" },
  [Tool.ZOOM]: { name: "Zoom" },
} as const;

/*enum PropertyPanel {
  NONE,
  NEW,
  PATHS,
  PATH_PROPS,
}*/

enum _KbdMod {
  Shift,
  Ctrl,
  Alt,
}

enum KeyboardModifier {
  None = 0,
  Shift = 1 << _KbdMod.Shift,
  Ctrl = 1 << _KbdMod.Ctrl,
  Alt = 1 << _KbdMod.Alt,
}

function getKeyboardModifierState(event: MouseEvent | KeyboardEvent | React.MouseEvent | React.KeyboardEvent): number {
  const shift = event.getModifierState("Shift");
  const ctrl = event.getModifierState("Control");
  const alt = event.getModifierState("Alt");
  return +shift << _KbdMod.Shift | +ctrl << _KbdMod.Ctrl | +alt << _KbdMod.Alt;
}


export default function App() {
  const [ size, setSize ] = useState([ 16, 16 ]);
  const [ bottomHeight, setBottomHeight ] = useState(200);
  const [ dragModal, setDragModal ] = useState(DragModalState.OFF);
  const [ lightMode, setLightMode ] = useState(false);
  const [ tool, setTool ] = useState(Tool.CURSOR);
  const [ canvasOffset, setCanvasOffset ] = useState({ x: 0, y: 0 });
  // const [ propertyPanel, setPropertyPanel ] = useState(PropertyPanel.NONE);
  const canvasRef = useRef<SVGSVGElement>(null);


  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const { width, height } = canvasRef.current.getBoundingClientRect();
    setCanvasOffset({ x: width / 2 - size[0] / 2 * 10, y: height / 2 - size[0] / 2 * 10 });

    canvasRef.current.addEventListener("wheel", canvasScrollEvent, { passive: false });

    return () => {
      canvasRef.current?.removeEventListener("wheel", canvasScrollEvent);
    };
  }, []);


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

  const canvasMouseDownEvent = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log("down", e.buttons);
  }, []);

  const canvasMouseUpEvent = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log("up", e.buttons);
  }, []);

  const canvasMouseMoveEvent = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    if ((tool === Tool.MOVE && e.buttons === 1) || e.buttons === 4) {
      setCanvasOffset(({ x, y }) => ({ x: x + e.movementX, y: y + e.movementY }));
    }
    // console.log((e.target as HTMLElement));
  }, [ tool ]);

  const canvasScrollEvent = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const mods = getKeyboardModifierState(e);

    if (mods === KeyboardModifier.None) {
      setCanvasOffset(({ x, y }) => ({ x: x - e.deltaX, y: y - e.deltaY }));
    }
    if (mods === KeyboardModifier.Shift) {
      setCanvasOffset(({ x, y }) => ({ x: x - e.deltaY, y: y - e.deltaX }));
    }
    if (mods === KeyboardModifier.Alt) {
      // setCanvasOffset(({ x, y }) => ({ x: x - e.deltaY, y: y - e.deltaY }));
    }
  }, []);

  return <>
    <div id="menubar">
      <div>
        Select size:
        <input
              type="number"
              min={0}
              value={size[0]}
              onChange={({ target: { value } }) => setSize([ Number(value), size[1] ])}
              placeholder="width" />
        <input
              type="number"
              min={0}
              value={size[1]}
              onChange={({ target: { value } }) => setSize([ size[0], Number(value) ])}
              placeholder="height" />
        <button>Create</button>
      </div>
    </div>

    <div className="sidebar">
      {toolList.map((tools, i) => [
        i === 0 ? null : <hr key={`hr-${i}`} />,
        tools.map(t => <div
              key={t}
              className={tool === t ? "active" : undefined}
              onClick={() => setTool(t)}
              title={`${toolData[t].name}${toolData[t].description ? `\n${toolData[t].description}` : ""}`}
        >{toolData[t].name}</div>),
      ])}
    </div>
    <svg
          width="100%" height="100%"
          className={classNames("canvas", { light: lightMode })}
          onMouseDown={canvasMouseDownEvent}
          onMouseUp={canvasMouseUpEvent}
          onContextMenu={e => e.preventDefault()}
          onMouseMove={canvasMouseMoveEvent}
          ref={canvasRef}
    >
      <pattern id="grid" x={canvasOffset.x % 10} y={canvasOffset.y % 10} viewBox="0 0 10 10" width={10} height={10} patternUnits="userSpaceOnUse"
               stroke="#8888">
        <line x1={0} x2={10} strokeWidth={1} />
        <line y1={0} y2={10} strokeWidth={1} />
      </pattern>
      <rect stroke="black" width={size[0] * 10 + 1} height={size[1] * 10 + 1} x={canvasOffset.x} y={canvasOffset.y} strokeWidth={2} className="page" />
      <rect fill="url(#grid)" width="200%" height="200%" className="grid" />
    </svg>
    <div className="sidebar">
      <div>New</div>
      <div>Paths</div>
      <div>Path properties</div>
      <hr />
      <div
            className={lightMode ? "active" : undefined}
            onClick={() => setLightMode(v => !v)}>Light
      </div>
    </div>
    <div id="size-adjust" onMouseDown={() => setDragModal(DragModalState.RESIZE_BOTTOM)}></div>
    <div className="sidebar" style={{ height: bottomHeight }}>
      <div>Q</div>
      <div>W</div>
      <div>E</div>
    </div>
    <div className="textarea" style={{ height: bottomHeight }}>Textarea</div>
    <div className="sidebar" style={{ height: bottomHeight }}>
      <div>A</div>
      <div>S</div>
      <div>D</div>
      <div>D</div>
    </div>
    <div id="modals">
      {dragModal !== DragModalState.OFF ? <div
            style={{ cursor: dragModal }}
            onMouseUp={() => setDragModal(DragModalState.OFF)}
            onMouseMove={dragModalMove} /> : null}
    </div>
  </>;
}
