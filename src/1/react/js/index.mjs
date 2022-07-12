import { createRoot } from 'react-dom/client';
import Form from "../js/modules/Form.mjs"
import Hello from "../js/modules/Hello.mjs"
import Counter from "../js/modules/Counter.mjs"
import AutoCounterClass from "../js/modules/AutoCounterClass.mjs"
import AutoCounterFunction from "../js/modules/AutoCounterFunction.mjs"

$(function () {
  function placeComponent(id, tag) {
    const container = document.getElementById(id);
    const root = createRoot(container);
    root.render(tag);
  }

  placeComponent('hello', <Hello />);
  placeComponent('form', <Form />);
  placeComponent('counter', <Counter />);
  placeComponent('autoCounterClass', <AutoCounterClass prefix="Contador es:" />);
  placeComponent('autoCounterFunction', <AutoCounterFunction prefix="Contador es:" />);

});