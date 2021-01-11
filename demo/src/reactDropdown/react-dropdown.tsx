import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import { LoopPromise } from './util';
import './react-dropdown.scss';

interface ReactDropdownProps {
  overlay: any;                      // 下拉内容
  removeDistance?: number;           // 动画移动距离
  toggleClassTime?: number;          // 切换类名样式间隔时间
  checkMouseTime?: number;           // 检查鼠标是否移出的防抖间隔 ms
  disabledClickToClose?: boolean;    // 禁用overly点击冒泡关闭overly
  disabledTargetClickToClose?: boolean;// 禁用目标元素点击冒泡关闭overly
  disabled?: boolean;                // 是否禁用下拉菜单
}

export default class ReactDropdown extends Component<ReactDropdownProps, any> {
  static defaultProps = {
    removeDistance: 20,
    toggleClassTime: 50,
    checkMouseTime: 20,
    disabledClickToClose: false,
    disabledTargetClickToClose: false,
    disabled: false
  }

  boxRef: any = null;
  timer: any = null;
  divElement: any = null;
  constructor(props) {
    super(props);
    this.state = {
      isShowOverlay: false
    };
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.mousemoveEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mousemoveEvent)
  }

  private onMouseEnter = (event) => {
    this.initAndSetElement(event);
  }

  // 检测指针是否悬浮在内容上的事件
  private mousemoveEvent = (event) => {
    const { checkMouseTime } = this.props;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      if (this.checkTargetIsIncludeOrEqualNode(event.target, this.boxRef)) return;
      if (this.checkTargetIsIncludeOrEqualNode(event.target, this.divElement)) return;
      this.removeOverlay();
    }, checkMouseTime);
  };

  // 尝试删除Overlay
  private removeOverlay = () => {
    if (this.divElement) {
      if (this.divElement.hasClickEvent) this.divElement.removeEventListener('click', this.removeOverlay);
      new LoopPromise()
        .push(() => {
          if (this.divElement) {
            this.divElement.classList.remove('not-opacity');
            this.divElement.style.top = this.divElement.overlayYPosition + 'px';
          }
        })
        .push(() => {
          if (this.divElement) {
            document.body.removeChild(this.divElement);
            this.divElement = null;
          }
        }, 300)
        .start();
    }
  };

  private initAndSetElement = (mouseEnterEvent) => {
    const { disabledClickToClose, disabled } = this.props;
    if (this.divElement) {
      document.body.removeChild(this.divElement);
      this.divElement = null;
    }
    if (disabled) return;
    this.divElement = document.createElement('div');
    this.divElement.classList.add('react-dropdown-content');
    this.divElement.classList.add('not-visible');
    if (!disabledClickToClose) {
      this.divElement.addEventListener('click', this.removeOverlay);
      this.divElement.hasClickEvent = true;
    }
    const { overlay, removeDistance, toggleClassTime } = this.props;
    ReactDOM.render(overlay, this.divElement);
    document.body.appendChild(this.divElement)
    const targetInfo = this.boxRef.getBoundingClientRect();
      console.log('info', this.boxRef.offsetLeft)
    const halfModalWidth = this.divElement.getBoundingClientRect().width / 2;
    const overlayXPosition = targetInfo.left + targetInfo.width / 2 - halfModalWidth;
    const overlayYPosition = targetInfo.top + targetInfo.height;
    this.divElement.style.left = overlayXPosition + 'px';
    this.divElement.style.top = overlayYPosition + removeDistance + 'px';
    this.divElement.overlayYPosition = overlayYPosition + removeDistance;
    this.divElement.classList.remove('not-visible');
    new LoopPromise()
      .push(() => {
        if (this.divElement) {
          this.divElement.classList.add('not-opacity');
          this.divElement.style.top = overlayYPosition + 'px';
        }
      }, toggleClassTime)
      .start();
  };

  // 判断节点是否包含或等于目标节点
  private checkTargetIsIncludeOrEqualNode = (nodeToCheck, targetNode) => {
    if (!nodeToCheck || !targetNode) return false;
    if (nodeToCheck === targetNode) return true;
    let isInclude = false;
    let fatherNode = nodeToCheck.parentNode;
    while (!isInclude && fatherNode !== document.body) {
      if (fatherNode === targetNode) return isInclude = true;
      fatherNode = fatherNode.parentNode;
    }
    return isInclude;
  };

  // 点击目标元素关闭overlay
  private clickToCloseOverlay = () => {
    const { disabledTargetClickToClose } = this.props;
    if (!disabledTargetClickToClose) this.removeOverlay();
  }

  render() {
    const { children } = this.props;


    return (
      <div
        className="react-dropdown"
        onMouseEnter={this.onMouseEnter}
        onClick={this.clickToCloseOverlay}
        ref={ref => this.boxRef = ref}
      >
        { children }
      </div>
    );
  };
}

