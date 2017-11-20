import React, { Component } from 'react';
import 'Chart.scss';
class Chart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
        };
        this.offset = {
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
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
    componentWillReceiveProps(props) {
        if (props.animate && !this.props.animate) {
            this.refs.animateLine.beginElement();
            this.refs.animateArea.beginElement();
        }
    }

    handleWindowResize() {
        // clearTimeout(this.resizeTimer);
        // this.resizeTimer = setTimeout(() => {
            this.resize();
        // }, 1000);
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

    getMinMax(points) {
        const { height } = this.state;
        const { top, bottom } = this.offset;
        let maxValue = -Infinity;
        let minValue = Infinity;

        points.forEach((element) => {
            maxValue = Math.max(maxValue, element.value);
            minValue = Math.min(minValue, element.value);
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
        return points.map(({ value }) => proportion * (max - value));
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
        const { width, height } = this.state;

        const { points, prevPoints } = this.props;
        let pth = this.getPath(points);
        let prevPth = this.getPath(prevPoints);

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

    renderGrid() {
        const { width, height } = this.state;
        const { left, right, top, bottom } = this.offset;
        const fill = 'rgba(255, 255, 255, 0.4)';

        return (
            <g>
                <circle fill={fill} cx={left} cy={top} r="5"/>
                <circle fill={fill} cx={left} cy={height / 2} r="5"/>
                <circle fill={fill} cx={left} cy={height - bottom} r="5"/>
                <circle fill={fill} cx={width / 2} cy={top} r="5"/>
                <circle fill={fill} cx={width / 2} cy={height / 2} r="5"/>
                <circle fill={fill} cx={width / 2} cy={height - bottom} r="5"/>
                <circle fill={fill} cx={width - right} cy={top} r="5"/>
                <circle fill={fill} cx={width - right} cy={height / 2} r="5"/>
                <circle fill={fill} cx={width - right} cy={height - bottom} r="5"/>
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

    renderMarkers() {
        const coordinates = this.getCoordinates(this.props.points);
        return this.props.points.map(({ label, value }, index) => (
            <div
                key={index}
                className="snap-chart__marker snap-chart-marker"
                style={{
                    transform: `translateY(${coordinates[index]}px)`
                }}
            >
                <div className="snap-chart-marker__inner">
                    {value.toFixed(1)} %
                </div>
            </div>
        ));
    }

    renderLabels() {
        return this.props.points.map(({ label }, index) => (
            <div key={index} className="snap-chart__label" onMouseEnter={() => console.log(index)}>
                {label}
            </div>
        ));
    }

    render() {
        return (
            <div className="snap-chart" ref="container">
                {this.renderCanvas()}
                <div className="snap-chart__markers">
                    {this.renderMarkers()}
                </div>
                <div className="snap-chart__labels">
                    {this.renderLabels()}
                </div>
            </div>
        );
    }
}

export default Chart;
