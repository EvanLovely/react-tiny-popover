import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Constants, arrayUnique, targetPositionHasChanged, popoverInfosAreEqual } from './util';
import { ArrowContainer } from './ArrowContainer';
import { PopoverPortal } from './PopoverPortal';
let Popover = /** @class */ (() => {
    class Popover extends React.Component {
        constructor(props) {
            super(props);
            this.target = null;
            this.targetRect = null;
            this.targetPositionIntervalHandler = null;
            this.popoverDiv = null; // TODO: potentially move this inside of PopoverPortal?
            this.positionOrder = null;
            this.willUnmount = false;
            this.willMount = false;
            this.onResize = () => {
                this.renderPopover();
            };
            this.onClick = (e) => {
                const { onClickOutside, isOpen } = this.props;
                if (!this.willUnmount && !this.willMount && !this.popoverDiv.contains(e.target) && !this.target.contains(e.target) && onClickOutside && isOpen) {
                    onClickOutside(e);
                }
            };
            this.state = {
                popoverInfo: null,
                isTransitioningToClosed: false,
                internalisOpen: false,
            };
            this.willUnmount = false;
            this.willMount = true;
        }
        static getDerivedStateFromProps(props, state) {
            const { internalisOpen, isTransitioningToClosed } = state;
            const { isOpen } = props;
            if (internalisOpen === true && isOpen === false && !isTransitioningToClosed) {
                return {
                    internalisOpen: false,
                    isTransitioningToClosed: true,
                };
            }
            return null;
        }
        componentDidMount() {
            window.setTimeout(() => this.willMount = false);
            const { position, isOpen } = this.props;
            this.target = findDOMNode(this);
            this.positionOrder = this.getPositionPriorityOrder(position);
            this.updatePopover(isOpen);
        }
        componentWillUnmount() {
            this.willUnmount = true;
            window.clearTimeout(this.removePopoverTimeout);
            window.clearInterval(this.targetPositionIntervalHandler);
            window.removeEventListener('resize', this.onResize);
            window.removeEventListener('click', this.onClick);
            this.removePopover();
        }
        componentDidUpdate(prevProps) {
            if (this.target == null) {
                this.target = findDOMNode(this);
            }
            const { isOpen: prevIsOpen, align: prevAlign, position: prevPosition, transitionDuration: prevTransitionDuration } = prevProps;
            const { isOpen, position, transitionDuration, align } = this.props;
            this.positionOrder = this.getPositionPriorityOrder(this.props.position);
            const hasNewDestination = prevProps.contentDestination !== this.props.contentDestination;
            if (prevIsOpen !== isOpen ||
                prevAlign !== align ||
                prevPosition !== position ||
                hasNewDestination) {
                this.updatePopover(isOpen);
            }
            if (prevTransitionDuration !== transitionDuration) {
                this.popoverDiv.style.transition = `opacity ${transitionDuration}s`;
            }
        }
        render() {
            const { content } = this.props;
            const { popoverInfo, isTransitioningToClosed } = this.state;
            let popoverContent = null;
            if ((this.props.isOpen || isTransitioningToClosed) && this.popoverDiv && popoverInfo) {
                const getContent = (args) => typeof content === 'function'
                    ? content(args)
                    : content;
                popoverContent = (React.createElement(PopoverPortal, { element: this.popoverDiv, container: this.props.contentDestination || window.document.body, children: getContent(popoverInfo) }));
            }
            return (React.createElement(React.Fragment, null,
                this.props.children,
                popoverContent));
        }
        updatePopover(isOpen) {
            if (isOpen && this.target != null) {
                if (!this.popoverDiv || !this.popoverDiv.parentNode) {
                    const { transitionDuration } = this.props;
                    this.popoverDiv = this.createContainer();
                    this.popoverDiv.style.opacity = '0';
                    this.popoverDiv.style.transition = `opacity ${transitionDuration}s`;
                }
                window.addEventListener('resize', this.onResize);
                window.addEventListener('click', this.onClick);
                this.renderPopover();
            }
            else {
                this.removePopover();
            }
        }
        renderPopover(positionIndex = 0) {
            if (positionIndex >= this.positionOrder.length) {
                return;
            }
            this.renderWithPosition({ position: this.positionOrder[positionIndex], targetRect: this.target.getBoundingClientRect() }, (violation, rect) => {
                const { disableReposition, contentLocation } = this.props;
                if (violation && !disableReposition && !(typeof contentLocation === 'object')) {
                    this.renderPopover(positionIndex + 1);
                }
                else {
                    const { contentLocation, align } = this.props;
                    const { top: nudgedTop, left: nudgedLeft } = this.getNudgedPopoverPosition(rect);
                    const { top: rectTop, left: rectLeft } = rect;
                    const position = this.positionOrder[positionIndex];
                    let { top, left } = disableReposition ? { top: rectTop, left: rectLeft } : { top: nudgedTop, left: nudgedLeft };
                    if (contentLocation) {
                        const targetRect = this.target.getBoundingClientRect();
                        const popoverRect = this.popoverDiv.getBoundingClientRect();
                        ({ top, left } = typeof contentLocation === 'function' ? contentLocation({ targetRect, popoverRect, position, align, nudgedLeft, nudgedTop }) : contentLocation);
                        this.popoverDiv.style.left = `${left.toFixed()}px`;
                        this.popoverDiv.style.top = `${top.toFixed()}px`;
                    }
                    else {
                        let destinationTopOffset = 0;
                        let destinationLeftOffset = 0;
                        if (this.props.contentDestination) {
                            const destRect = this.props.contentDestination.getBoundingClientRect();
                            destinationTopOffset = -destRect.top;
                            destinationLeftOffset = -destRect.left;
                        }
                        const [absoluteTop, absoluteLeft] = [top + window.pageYOffset, left + window.pageXOffset];
                        const finalLeft = absoluteLeft + destinationTopOffset;
                        const finalTop = absoluteTop + destinationLeftOffset;
                        this.popoverDiv.style.left = `${finalLeft.toFixed()}px`;
                        this.popoverDiv.style.top = `${finalTop.toFixed()}px`;
                    }
                    this.popoverDiv.style.width = null;
                    this.popoverDiv.style.height = null;
                    this.renderWithPosition({
                        position,
                        nudgedTop: nudgedTop - rect.top,
                        nudgedLeft: nudgedLeft - rect.left,
                        targetRect: this.target.getBoundingClientRect(),
                        popoverRect: this.popoverDiv.getBoundingClientRect(),
                    }, () => {
                        this.startTargetPositionListener(10);
                        if (this.popoverDiv.style.opacity !== '1' && !this.state.isTransitioningToClosed) {
                            this.popoverDiv.style.opacity = '1';
                        }
                    });
                }
            });
        }
        renderWithPosition({ position, nudgedLeft = 0, nudgedTop = 0, targetRect = Constants.EMPTY_CLIENT_RECT, popoverRect = Constants.EMPTY_CLIENT_RECT }, callback) {
            const { windowBorderPadding: padding, align } = this.props;
            const popoverInfo = { position, nudgedLeft, nudgedTop, targetRect, popoverRect, align };
            if (!popoverInfosAreEqual(this.state.popoverInfo, popoverInfo)) {
                window.clearTimeout(this.removePopoverTimeout);
                this.setState({ popoverInfo, isTransitioningToClosed: false, internalisOpen: true }, () => {
                    if (this.willUnmount) {
                        return;
                    }
                    targetRect = this.target.getBoundingClientRect();
                    popoverRect = this.popoverDiv.getBoundingClientRect();
                    const { top, left } = this.getLocationForPosition(position, targetRect, popoverRect);
                    callback(position === 'top' && top < padding ||
                        position === 'left' && left < padding ||
                        position === 'right' && left + popoverRect.width > window.innerWidth - padding ||
                        position === 'bottom' && top + popoverRect.height > window.innerHeight - padding, { width: popoverRect.width, height: popoverRect.height, top, left });
                });
            }
        }
        startTargetPositionListener(checkInterval) {
            if (this.targetPositionIntervalHandler === null) {
                this.targetPositionIntervalHandler = window.setInterval(() => {
                    const newTargetRect = this.target.getBoundingClientRect();
                    if (targetPositionHasChanged(this.targetRect, newTargetRect)) {
                        this.renderPopover();
                    }
                    this.targetRect = newTargetRect;
                }, checkInterval);
            }
        }
        getNudgedPopoverPosition({ top, left, width, height }) {
            const { windowBorderPadding: padding } = this.props;
            top = top < padding ? padding : top;
            top = top + height > window.innerHeight - padding ? window.innerHeight - padding - height : top;
            left = left < padding ? padding : left;
            left = left + width > window.innerWidth - padding ? window.innerWidth - padding - width : left;
            return { top, left };
        }
        removePopover() {
            const { transitionDuration } = this.props;
            if (this.popoverDiv != null) {
                this.popoverDiv.style.opacity = '0';
            }
            const remove = () => {
                if (this.willUnmount || !this.props.isOpen || !this.popoverDiv.parentNode) {
                    window.clearInterval(this.targetPositionIntervalHandler);
                    window.removeEventListener('resize', this.onResize);
                    window.removeEventListener('click', this.onClick);
                    this.targetPositionIntervalHandler = null;
                    this.setState({ isTransitioningToClosed: false });
                }
            };
            if (!this.willUnmount) {
                this.removePopoverTimeout = window.setTimeout(remove, (transitionDuration || Constants.FADE_TRANSITION) * 1000);
            }
            else {
                remove();
            }
        }
        getPositionPriorityOrder(position) {
            if (position && typeof position !== 'string') {
                if (Constants.DEFAULT_POSITIONS.every(defaultPosition => position.find(p => p === defaultPosition) !== undefined)) {
                    return arrayUnique(position);
                }
                else {
                    const remainingPositions = Constants.DEFAULT_POSITIONS.filter(defaultPosition => position.find(p => p === defaultPosition) === undefined);
                    return arrayUnique([...position, ...remainingPositions]);
                }
            }
            else if (position && typeof position === 'string') {
                const remainingPositions = Constants.DEFAULT_POSITIONS.filter(defaultPosition => defaultPosition !== position);
                return arrayUnique([position, ...remainingPositions]);
            }
        }
        createContainer() {
            const { containerStyle, containerClassName } = this.props;
            const container = window.document.createElement('div');
            container.style.overflow = 'hidden';
            if (containerStyle) {
                Object.keys(containerStyle).forEach(key => container.style[key] = containerStyle[key]);
            }
            container.className = containerClassName;
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            return container;
        }
        getLocationForPosition(position, newTargetRect, popoverRect) {
            const { padding, align } = this.props;
            const targetMidX = newTargetRect.left + (newTargetRect.width / 2);
            const targetMidY = newTargetRect.top + (newTargetRect.height / 2);
            let top;
            let left;
            switch (position) {
                case 'top':
                    top = newTargetRect.top - popoverRect.height - padding;
                    left = targetMidX - (popoverRect.width / 2);
                    if (align === 'start') {
                        left = newTargetRect.left;
                    }
                    if (align === 'end') {
                        left = newTargetRect.right - popoverRect.width;
                    }
                    break;
                case 'left':
                    top = targetMidY - (popoverRect.height / 2);
                    left = newTargetRect.left - padding - popoverRect.width;
                    if (align === 'start') {
                        top = newTargetRect.top;
                    }
                    if (align === 'end') {
                        top = newTargetRect.bottom - popoverRect.height;
                    }
                    break;
                case 'bottom':
                    top = newTargetRect.bottom + padding;
                    left = targetMidX - (popoverRect.width / 2);
                    if (align === 'start') {
                        left = newTargetRect.left;
                    }
                    if (align === 'end') {
                        left = newTargetRect.right - popoverRect.width;
                    }
                    break;
                case 'right':
                    top = targetMidY - (popoverRect.height / 2);
                    left = newTargetRect.right + padding;
                    if (align === 'start') {
                        top = newTargetRect.top;
                    }
                    if (align === 'end') {
                        top = newTargetRect.bottom - popoverRect.height;
                    }
                    break;
            }
            return { top, left };
        }
    }
    Popover.defaultProps = {
        padding: Constants.DEFAULT_PADDING,
        windowBorderPadding: Constants.DEFAULT_WINDOW_PADDING,
        position: ['top', 'right', 'left', 'bottom'],
        align: 'center',
        containerClassName: Constants.POPOVER_CONTAINER_CLASS_NAME,
        transitionDuration: Constants.FADE_TRANSITION,
    };
    return Popover;
})();
export { ArrowContainer };
export default Popover;
//# sourceMappingURL=Popover.js.map