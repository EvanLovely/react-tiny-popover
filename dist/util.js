export const Constants = {
    POPOVER_CONTAINER_CLASS_NAME: 'react-tiny-popover-container',
    DEFAULT_PADDING: 6,
    DEFAULT_WINDOW_PADDING: 6,
    FADE_TRANSITION: 0.35,
    DEFAULT_ARROW_COLOR: 'black',
    DEFAULT_POSITIONS: ['top', 'left', 'right', 'bottom'],
    EMPTY_CLIENT_RECT: {
        top: 0,
        left: 0,
        bottom: 0,
        height: 0,
        right: 0,
        width: 0,
    },
};
export const arrayUnique = (array) => array.filter((value, index, self) => self.indexOf(value) === index);
export const rectsAreEqual = (rectA, rectB) => rectA === rectB ||
    (rectA === null || rectA === void 0 ? void 0 : rectA.bottom) === (rectB === null || rectB === void 0 ? void 0 : rectB.bottom) &&
        (rectA === null || rectA === void 0 ? void 0 : rectA.height) === (rectB === null || rectB === void 0 ? void 0 : rectB.height) &&
        (rectA === null || rectA === void 0 ? void 0 : rectA.left) === (rectB === null || rectB === void 0 ? void 0 : rectB.left) &&
        (rectA === null || rectA === void 0 ? void 0 : rectA.right) === (rectB === null || rectB === void 0 ? void 0 : rectB.right) &&
        (rectA === null || rectA === void 0 ? void 0 : rectA.top) === (rectB === null || rectB === void 0 ? void 0 : rectB.top) &&
        (rectA === null || rectA === void 0 ? void 0 : rectA.width) === (rectB === null || rectB === void 0 ? void 0 : rectB.width);
export const popoverInfosAreEqual = (infoA, infoB) => infoA === infoB ||
    (infoA === null || infoA === void 0 ? void 0 : infoA.align) === (infoB === null || infoB === void 0 ? void 0 : infoB.align) &&
        (infoA === null || infoA === void 0 ? void 0 : infoA.nudgedLeft) === (infoB === null || infoB === void 0 ? void 0 : infoB.nudgedLeft) &&
        (infoA === null || infoA === void 0 ? void 0 : infoA.nudgedTop) === (infoB === null || infoB === void 0 ? void 0 : infoB.nudgedTop) &&
        rectsAreEqual(infoA === null || infoA === void 0 ? void 0 : infoA.popoverRect, infoB === null || infoB === void 0 ? void 0 : infoB.popoverRect) &&
        rectsAreEqual(infoA === null || infoA === void 0 ? void 0 : infoA.targetRect, infoB === null || infoB === void 0 ? void 0 : infoB.targetRect) &&
        (infoA === null || infoA === void 0 ? void 0 : infoA.position) === (infoB === null || infoB === void 0 ? void 0 : infoB.position);
export const targetPositionHasChanged = (oldTargetRect, newTargetRect) => oldTargetRect === null
    || oldTargetRect.left !== newTargetRect.left
    || oldTargetRect.top !== newTargetRect.top
    || oldTargetRect.width !== newTargetRect.width
    || oldTargetRect.height !== newTargetRect.height;
//# sourceMappingURL=util.js.map