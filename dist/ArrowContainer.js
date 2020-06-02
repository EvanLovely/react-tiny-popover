import * as React from 'react';
import { Constants } from './util';
const ArrowContainer = ({ position, children, style, arrowColor = Constants.DEFAULT_ARROW_COLOR, arrowSize = 10, arrowStyle, popoverRect, targetRect, }) => (React.createElement("div", { style: Object.assign({ paddingLeft: position === 'right' ? arrowSize : 0, paddingTop: position === 'bottom' ? arrowSize : 0, paddingBottom: position === 'top' ? arrowSize : 0, paddingRight: position === 'left' ? arrowSize : 0 }, style) },
    React.createElement("div", { style: Object.assign(Object.assign({ position: 'absolute' }, (() => {
            const arrowWidth = arrowSize * 2;
            let top = (targetRect.top - popoverRect.top) + (targetRect.height / 2) - (arrowWidth / 2);
            let left = (targetRect.left - popoverRect.left) + (targetRect.width / 2) - (arrowWidth / 2);
            left = left < 0 ? 0 : left;
            left = left + arrowWidth > popoverRect.width ? popoverRect.width - arrowWidth : left;
            top = top < 0 ? 0 : top;
            top = top + arrowWidth > popoverRect.height ? popoverRect.height - arrowWidth : top;
            switch (position) {
                case 'right':
                    return {
                        borderTop: `${arrowSize}px solid transparent`,
                        borderBottom: `${arrowSize}px solid transparent`,
                        borderRight: `${arrowSize}px solid ${arrowColor}`,
                        left: 0,
                        top,
                    };
                case 'left':
                    return {
                        borderTop: `${arrowSize}px solid transparent`,
                        borderBottom: `${arrowSize}px solid transparent`,
                        borderLeft: `${arrowSize}px solid ${arrowColor}`,
                        right: 0,
                        top,
                    };
                case 'bottom':
                    return {
                        borderLeft: `${arrowSize}px solid transparent`,
                        borderRight: `${arrowSize}px solid transparent`,
                        borderBottom: `${arrowSize}px solid ${arrowColor}`,
                        top: 0,
                        left,
                    };
                case 'top':
                default:
                    return {
                        borderLeft: `${arrowSize}px solid transparent`,
                        borderRight: `${arrowSize}px solid transparent`,
                        borderTop: `${arrowSize}px solid ${arrowColor}`,
                        bottom: 0,
                        left,
                    };
            }
        })()), arrowStyle) }),
    children));
export { ArrowContainer };
//# sourceMappingURL=ArrowContainer.js.map