import { useRef } from 'react';

export default function Form() {
    const nameRef = useRef();
    function handleSubmit(e) {
        e.preventDefault();
        console.log('You clicked submit.');
        console.log(nameRef.current.value)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" ref={nameRef}/>
            <button type="submit">Submit</button>
        </form>
    );
}
