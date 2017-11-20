import React, { Component } from 'react';
import 'Chart.scss';
class Chart extends Component {
    constructor(props) {
        super(props);

        this.offset = {
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
        };

        this.state = {
            width: 0,
            height: 0,
            activeSetIndex: 0,
            previousSetIndex: 0,
            activeMarkerIndex: -1,
            activeMarkerTop: 0,
            activeMarkerLeft: 0
        };

        this.resize = this.resize.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
        this.resize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    componentWillUpdate({}, state) {
        if (state.animate && !this.state.animate) {
            this.refs.animateLine.beginElement();
            this.refs.animateArea.beginElement();
        }
    }

    handleWindowResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.resize();
            this.refs.animateLine.beginElement();
            this.refs.animateArea.beginElement();
        }, 200);
    }

    resize() {
        if (this.refs.container) {
            const { offsetHeight, offsetWidth } = this.refs.container;
            this.setState({
                width: offsetWidth,
                height: offsetHeight
            });
        }
    }

    changeSet(setIndex) {
        if (!this.state.animate) {
            this.setState({
                activeSetIndex: setIndex,
                previousSetIndex: this.state.activeSetIndex,
                animate: true
            });

            setTimeout(() => {
                this.setState({ animate: false })
            }, 300);
        }
    }

    getMinMax(points) {
        const { height } = this.state;
        const { top, bottom } = this.offset;
        let maxValue = -Infinity;
        let minValue = Infinity;

        points.forEach((value) => {
            maxValue = Math.max(maxValue, value);
            minValue = Math.min(minValue, value);
        });
        let min = minValue;
        let max = maxValue;

        if (maxValue > 10) {
            max = maxValue + 8;
            min = Math.max(-0.1, minValue - 3);
        } else if (maxValue > 3) {
            max = maxValue + 2;
            min = Math.max(-0.1, minValue - 2);
        } else if (maxValue > 1) {
            max = maxValue + 1;
            min = Math.max(-0.1, minValue - 1);
        } else {
            max = 1.5;
            min = Math.max(-0.1, min - 1);
        }

        return {
            min,
            max,
            proportion: (height - top - bottom) / (max - min)
        }
    }

    getCoordinates(points) {
        const { max = 0, proportion = 1 } = this.getMinMax(points);
        return points.map(value => proportion * (max - value));
    }

    getPath(points) {
        const svgPoints = [];
        if (points.length) {
            const coordinates = this.getCoordinates(points);
            const { left, right } = this.offset;
            const { width } = this.state;
            const step = (width - left - right) / 10;

            points.forEach((point, i) => {
                if (i === 0) {
                    svgPoints.push('M');
                    svgPoints.push(`${left},${coordinates[0]}`);
                } else if (i === 1) {
                    svgPoints.push('C');
                    svgPoints.push(`${left + .25 * step},${coordinates[0]}`);
                    svgPoints.push(`${left + .75 * step},${coordinates[1]}`);
                    svgPoints.push(`${left + step},${coordinates[1]}`);
                } else {
                    svgPoints.push('S');
                    svgPoints.push(`${left + step * (i - .25)},${coordinates[i]}`);
                    svgPoints.push(`${left + i * step},${coordinates[i]}`);
                }
            });
        }
        return svgPoints.join(' ');
    }

    renderCurve() {
        const { left, right, bottom } = this.offset;
        const { width, height, activeSetIndex, previousSetIndex } = this.state;

        const { data } = this.props;
        const { [activeSetIndex]: activeSet, [previousSetIndex]: previousSet } = data;
        let pth = this.getPath(activeSet.points);
        let prevPth = this.getPath(previousSet.points);

        return (
            <g>
                <path
                    id="line"
                    strokeLinecap="round"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    d={pth}
                >
                </path>
                <animate xlinkHref="#line"
                    ref="animateLine"
                    begin="indefinite"
                    attributeName="d"
                    attributeType="XML"
                    from={prevPth}
                    to={pth}
                    dur="300ms"
                    fill="freeze"
                />
                <path
                    id="area"
                    strokeLinecap="round"
                    fill="rgba(255, 255, 255, 0.3)"
                    d={`${pth} L ${width - right},${height - bottom} ${left},${height - bottom}`}
                >
                </path>
                <animate xlinkHref="#area"
                    ref="animateArea"
                    begin="indefinite"
                    attributeName="d"
                    attributeType="XML"
                    from={`${prevPth} L ${width - right},${height - bottom} ${left},${height - bottom}`}
                    to={`${pth} L ${width - right},${height - bottom} ${left},${height - bottom}`}
                    dur="300ms"
                    fill="freeze"
                />
            </g>
        );
    }

    renderCanvas() {
        const { width, height } = this.state;

        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {this.renderCurve()}
                {/*{this.renderGrid()}*/}
            </svg>
        );
    }

    setActiveMarker(index, left) {
        console.log(left);
        clearTimeout(this.resetMarkerTimer);
        this.setState({
            activeMarkerIndex: index,
            activeMarkerLeft: left
        });
    }

    resetActiveMarker() {
        this.resetMarkerTimer = setTimeout(() => {
            this.setState({
                activeMarkerIndex: -1,
                activeMarkerLeft: 0
            });
        }, 2000);
    }

    renderMarkers() {
        const { activeSetIndex } = this.state;

        const { data } = this.props;
        const { [activeSetIndex]: activeSet } = data;
        const coordinates = this.getCoordinates(activeSet.points);
        return activeSet.points.map((value, index) => (
            <div
                key={index}
                className="the-chart__marker the-chart-marker"
                onMouseEnter={({ target }) => {
                    this.setActiveMarker(index, target.parentNode.offsetLeft)
                }}
                onMouseLeave={() => {
                    this.resetActiveMarker()
                }}
                style={{
                    transform: `translateY(${coordinates[index]}px)`
                }}
            >
                <div className="the-chart-marker__inner">
                    {value.toFixed(1)}%
                </div>
            </div>
        ));
    }

    renderTooltipTriangle() {
        const { data } = this.props;
        const { activeSetIndex, activeMarkerIndex, activeMarkerLeft, width } = this.state;
        const coordinates = this.getCoordinates(data[activeSetIndex].points);

        const x = activeMarkerLeft;
        const y = coordinates[activeMarkerIndex];

        if (activeMarkerIndex === -1) return null;

        return (
            <div
                style={{
                    transform: `translate(${x}px, ${y}px) rotate(45deg)`
                }}
                className="the-chart-tooltip__triangle"
            />
        );

    }

    renderTooltip() {
        const { data } = this.props;
        const { activeSetIndex, activeMarkerIndex, activeMarkerLeft, width } = this.state;
        const coordinates = this.getCoordinates(data[activeSetIndex].points);
        const tooltipValues = data.map(({ points }) => points[activeMarkerIndex]);
        const x = Math.max(-20, Math.min(activeMarkerLeft - 75, width - 170));
        const y = coordinates[activeMarkerIndex];

        if (activeMarkerIndex === -1) return null;

        return (
            <div
                style={{
                    transform: `translate(${x}px, ${y}px)`
                }}
                className="the-chart__tooltip the-chart-tooltip"
                onMouseEnter={() => { clearTimeout(this.resetMarkerTimer); }}
                onMouseLeave={() => { this.resetActiveMarker(); }}
            >
                {tooltipValues.map((value, index) => (
                    <div
                        key={index}
                        className={`
                            thi-chart-tooltip__row
                            ${index === activeSetIndex ? 'the-chart-tooltip__row--active' : ''}
                        `}
                    >
                        {data[index].title}
                        <div className="the-chart-tooltip__value">
                            {value.toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    renderLabels() {
        const { firstYearLabel, data } = this.props;
        const { points } = data[this.state.activeSetIndex];
        return points.map(({}, index) => (
            <div key={index} className="the-chart__label">
                {firstYearLabel + index}
            </div>
        ));
    }

    renderTabs() {
        const { data } = this.props;
        return this.props.data.map(({ title }, index) => (
            <button
                key={index}
                onClick={this.changeSet.bind(this, index)}
                className={`
                    the-chart__tab
                    ${index === this.state.activeSetIndex ? 'the-chart__tab--active' : ''}
                `}
            >
                {title} {data[index].points[data[index].points.length - 1].toFixed(1)}%
            </button>
        ));
    }

    render() {
        return (
            <div>
                <div className="the-chart__inner" ref="container">
                    {this.renderCanvas()}
                    <div className="the-chart__markers">
                        {this.renderMarkers()}
                        {this.renderTooltip()}
                        {this.renderTooltipTriangle()}
                    </div>
                    <div className="the-chart__labels">
                        {this.renderLabels()}
                    </div>
                </div>
                <div className="the-chart__tabs">
                    {this.renderTabs()}
                </div>
            </div>
        );
    }
}

export default Chart;
