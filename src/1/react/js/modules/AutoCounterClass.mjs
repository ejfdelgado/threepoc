import React from 'react';

export default class AutoCounterClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
        this.autoIncrement();
    }

    autoIncrement() {
        setInterval(() => {
            this.setState({ count: this.state.count + 1 })
        }, 1000);
    }

    render() {
        return (
            <div>
                <h1>{this.props.prefix}{this.state.count}</h1>
            </div>
        );
    }
}