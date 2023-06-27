import { useState } from "react";

export default function App() {
  const [ size, setSize ] = useState([ 16, 16 ]);

  return <>
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
    <svg width="100%" height="100%">
      <pattern id="p1" viewBox="0 0 10 10" width={10} height={10} patternUnits="userSpaceOnUse">
        <line x1={0} x2={10} stroke="#8888" strokeWidth={1} />
        <line y1={0} y2={10} stroke="#8888" strokeWidth={1} />
      </pattern>
      <rect fill="url(#p1)" width="100%" height="100%" />
    </svg>
    <textarea></textarea>
  </>
}
