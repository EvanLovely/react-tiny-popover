import * as React from 'react';
import { createPortal } from 'react-dom';
class PopoverPortal extends React.PureComponent {
    componentDidMount() {
        this.props.container.appendChild(this.props.element);
    }
    componentWillUnmount() {
        this.props.container.removeChild(this.props.element);
    }
    componentDidUpdate(prevProps) {
        const { container: prevContainer } = prevProps;
        const { container, element } = this.props;
        if (prevContainer !== container) {
            prevContainer.removeChild(element);
            container.appendChild(element);
        }
    }
    render() {
        return createPortal(this.props.children, this.props.element);
    }
}
export { PopoverPortal };
//# sourceMappingURL=PopoverPortal.js.map