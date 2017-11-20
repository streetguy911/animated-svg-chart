import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Chart from 'Chart';
import 'app.scss';

const points = [
    { label: 2007, value: 51.3 },
    { label: 2008, value: 56.5 },
    { label: 2009, value: 56.7 },
    { label: 2010, value: 57.3 },
    { label: 2011, value: 57.9 },
    { label: 2012, value: 58.5 },
    { label: 2013, value: 58.1 },
    { label: 2014, value: 60.4 },
    { label: 2015, value: 61.0 },
    { label: 2016, value: 61.5 },
    { label: 2017, value: 61.4 },
];

const points2 = [
    { label: 2007, value: 56.3 },
    { label: 2008, value: 52.5 },
    { label: 2009, value: 53.7 },
    { label: 2010, value: 58.3 },
    { label: 2011, value: 54.9 },
    { label: 2012, value: 51.5 },
    { label: 2013, value: 50.1 },
    { label: 2014, value: 61.4 },
    { label: 2015, value: 54.0 },
    { label: 2016, value: 62.5 },
    { label: 2017, value: 57.4 },
];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            points: points,
            prevPoints: points2
        };
        this.changeSet = this.changeSet.bind(this);
    }

    changeSet() {
        if (!this.state.animate) {
            this.setState({
                points: this.state.points === points ? points2 : points,
                prevPoints: this.state.points === points ? points : points2,
                animate: true
            });
            setTimeout(() => {
                this.setState({ animate: false })
            }, 300);
        }
    }

    render() {
        return (
            <div className="app">
                <Chart
                    {...this.state}
                />
                <button onClick={this.changeSet} style={{ position: 'fixed', bottom: '50px', left: '50px' }}>
                    change
                </button>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector('#app')
);