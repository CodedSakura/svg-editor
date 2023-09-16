import * as classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SVGElements } from "./objects.tsx";

enum DragModalState {
  OFF = "auto",
  RESIZE_BOTTOM = "ns-resize"
}

enum Tool {
  CURSOR,
  RECT,
  ELLIPSE,
  LINE,
  ARC,
  BEZIER,
  MOVE,
  ZOOM,
}

const toolList = [
  [
    Tool.RECT,
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
  [Tool.RECT]: { name: "Rectangle" },
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

interface CUtilProps {
  absoluteCoords?: boolean,
  rounded?: boolean,
}

export default function App() {
  const [ size, setSize ] = useState([ 16, 16 ]);
  const [ bottomHeight, setBottomHeight ] = useState(200);
  const [ dragModal, setDragModal ] = useState(DragModalState.OFF);
  const [ lightMode, setLightMode ] = useState(false);
  const [ tool, setTool ] = useState(Tool.CURSOR);
  const [ canvasOffset, setCanvasOffset ] = useState({ x: 0, y: 0 });
  const [ canvasPixelSize, setCanvasPixelSize ] = useState(10);
  // const [ propertyPanel, setPropertyPanel ] = useState(PropertyPanel.NONE);
  const [ elements, setElements ] = useState<SVGElements.Element[]>([]);
  const [ dragStart, setDragStart ] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<SVGSVGElement>(null);


  const cUtil = {
    toCanvas: (v: [ number, number ] | { x: number, y: number }, { absoluteCoords = true, rounded = true } = {}): [ number, number ] => {
      const round = rounded ? Math.round : (v: number) => v;
      const offset = absoluteCoords ? canvasOffset : { x: 0, y: 0 };

      let x: number, y: number;
      if (Array.isArray(v)) {
        [ x, y ] = v;
      } else {
        ({ x, y } = v);
      }

      return [
        round((x - offset.x) / canvasPixelSize),
        round((y - offset.y) / canvasPixelSize),
      ];
    },
    toCanvasX: (x: number, props?: CUtilProps): number => cUtil.toCanvas([ x, 0 ], props)[0],
    toCanvasY: (y: number, props?: CUtilProps): number => cUtil.toCanvas([ 0, y ], props)[1],
  };


  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const { width, height } = canvasRef.current.getBoundingClientRect();
    setCanvasOffset({ x: width / 2 - size[0] / 2 * canvasPixelSize, y: height / 2 - size[0] / 2 * canvasPixelSize });

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
    setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

    if (tool === Tool.RECT && e.buttons === 1) {
      setElements(v => [
        new SVGElements.Rectangle(...cUtil.toCanvas([ e.nativeEvent.offsetX, e.nativeEvent.offsetY ])),
        ...v,
      ]);
    }
  }, [ tool ]);

  const canvasMouseUpEvent = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const canvasMouseMoveEvent = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    if ((tool === Tool.MOVE && e.buttons === 1) || e.buttons === 4) {
      setCanvasOffset(({ x, y }) => ({ x: x + e.movementX, y: y + e.movementY }));
    }
    if (tool === Tool.RECT && e.buttons === 1) {
      setElements(([ s, ...v ]) => {
        if (s instanceof SVGElements.Rectangle) {
          const { x: sx, y: sy } = dragStart;
          const mx = e.nativeEvent.offsetX, my = e.nativeEvent.offsetY;

          const w = cUtil.toCanvasX(mx - sx, { absoluteCoords: false });
          const h = cUtil.toCanvasX(my - sy, { absoluteCoords: false });

          s.width = Math.abs(w);
          s.height = Math.abs(h);
          s.x = cUtil.toCanvasX(sx) + (w < 0 ? w : 0);
          s.y = cUtil.toCanvasY(sy) + (h < 0 ? h : 0);
        }
        return [ s, ...v ];
      });
    }
  }, [ tool, dragStart ]);

  const canvasScrollEvent = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const mods = getKeyboardModifierState(e);

    if (mods === KeyboardModifier.None) {
      setCanvasOffset(({ x, y }) => ({ x: x - e.deltaX, y: y - e.deltaY }));
    }
    if (mods === KeyboardModifier.Shift) {
      setCanvasOffset(({ x, y }) => ({ x: x - e.deltaY, y: y - e.deltaX }));
    }
    if (mods === KeyboardModifier.Ctrl) {
      setCanvasPixelSize(v => Math.max(1, v - Math.sign(e.deltaY) * Math.ceil(Math.cbrt(v))));
    }
    if (mods === (KeyboardModifier.Shift | KeyboardModifier.Ctrl)) {
      setCanvasPixelSize(v => Math.max(1, v - Math.sign(e.deltaY) * .5));
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
      <pattern id="grid" x={canvasOffset.x % canvasPixelSize} y={canvasOffset.y % canvasPixelSize} viewBox={`0 0 ${canvasPixelSize} ${canvasPixelSize}`}
               width={canvasPixelSize} height={canvasPixelSize} patternUnits="userSpaceOnUse"
               stroke="#8888">
        <line x1={0} x2={canvasPixelSize} strokeWidth={1} />
        <line y1={0} y2={canvasPixelSize} strokeWidth={1} />
      </pattern>
      <rect stroke="black" width={size[0] * canvasPixelSize + 1} height={size[1] * canvasPixelSize + 1} x={canvasOffset.x} y={canvasOffset.y} strokeWidth={2}
            className="page" />

      {elements.map((v, i) => v.toJSX(canvasOffset, canvasPixelSize, i))}

      {canvasPixelSize === 1 ? null : <rect fill="url(#grid)" width="200%" height="200%" className="grid" />}
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
    <div className="textarea" style={{ height: bottomHeight }}>
      {elements.map((v, i) => v.toText()).join("\n")}
    </div>
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
