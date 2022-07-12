import { useState, useEffect, useLayoutEffect } from 'react';

export default function AutoCounterFunction(props) {

    const [count, asignarConteo] = useState(0);

    function autoIncrement() {
        setTimeout(() => {
            asignarConteo(count + 1)
        }, 1000);
    }


    useEffect(() => {
        console.log(
            "Occurs ONCE, AFTER the initial render."
        );
    }, []);

    useLayoutEffect(() => {
        console.log(
            "Occurs ONCE, but it still occurs AFTER the initial render."
        );
    }, []);

    autoIncrement();

    console.log("Occurs EVERY time the component is invoked.");
    return (<div><h1>{props.prefix}{count}</h1></div>);
}