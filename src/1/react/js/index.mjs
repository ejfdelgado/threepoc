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

function Form() {
  function handleSubmit(e) {
    e.preventDefault();
    console.log('You clicked submit.');
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
}


$(function () {
  const root = createRoot(document.getElementById('root'));
  root.render(<Form />);
});