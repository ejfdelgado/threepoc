import { createRoot } from 'react-dom/client';
import { useState } from 'react';

function App() {
  return <div>Hello World</div>;
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </>
  );
}


$(function () {
  const root = createRoot(document.getElementById('root'));
  root.render(<Counter />);
});