import React from "react";
import AutoCounterFunction from "./AutoCounterFunction.mjs";
import AutoCounterClass from "./AutoCounterClass.mjs";

export default class CompositeClass extends React.Component {
    render() {
        return (<div>
            <AutoCounterFunction prefix="Contador es:" />
            <AutoCounterClass prefix="Contador es:" />
        </div>);
    }
}