import React, {Component} from 'react';
import './App.scss';
// import Dropdown from './reactDropdown';
import Dropdown from '../../lib/bundle';


class App extends Component<any, any> {

    render() {

        return (
            <div className="home-page">
                <Dropdown overlay={
                    <div className="overlay">悬浮内容</div>
                }>
                    <div className="content">
                        悬浮显示下拉
                    </div>
                </Dropdown>
            </div>
        );
    }
}

export default App;
