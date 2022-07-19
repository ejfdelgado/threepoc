import { createRoot } from 'react-dom/client';
import Form from "../js/modules/Form.mjs"
import Hello from "../js/modules/Hello.mjs"
import Counter from "../js/modules/Counter.mjs"
import CompositeClass from "../js/modules/CompositeClass.mjs"

$(function () {
  function placeComponent(id, tag) {
    const container = document.getElementById(id);
    const root = createRoot(container);
    root.render(tag);
  }

  // https://es.reactjs.org/docs/render-props.html
  // https://reactnative.dev/docs/intro-react
  // https://es.reactjs.org/docs/hooks-custom.html
  placeComponent('hello', <Hello />);
  placeComponent('form', <Form />);
  placeComponent('counter', <Counter />);
  placeComponent('compositeClass', <CompositeClass/>);

});