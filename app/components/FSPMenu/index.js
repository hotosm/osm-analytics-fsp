import React, {Component} from 'react'
import Dropdown from 'rc-dropdown'
import Menu, {Item as MenuItem, Divider, SubMenu} from 'rc-menu'
import 'rc-dropdown/assets/index.css';
import 'rc-menu/assets/index.css';
import style from './style.css'
import {createHashHistory} from 'history'
const history = createHashHistory({queryKey: false});
class FSPMenu extends Component {

    state = {
        visible: false
    };

    onClick({selectedKeys}) {
        if (!this.props.multiple) {
            this.setState({
                visible: false
            })
        }
    }

    onSelect({selectedKeys}) {
        this.handleDropdownChanges(selectedKeys)
    }

    onVisibleChange(visible) {
        this.setState({visible})
    }

    getDefaultView() {
        return 'fspug/qn1';
    }

    handleDropdownChanges(selectedFilters) {
        const selected = selectedFilters[0] || this.getDefaultView();
        const split = selected.split('/');
        const country = split[0];
        const view = split[1];
        console.log("stateTo Load", {country, view});
        history.replace(`/fsp/${country}/${view}`);
    }

    render() {

        const menu = (
            <Menu
                multiple={this.props.multiple}
                onClick={this.onClick.bind(this)}
                onSelect={this.onSelect.bind(this)}
                onDeselect={this.onSelect.bind(this)}
                className={this.props.multiple ? 'checkboxes' : ''}
            >
                {options.map(({id, description, subMenu}) => {
                        if (subMenu) {
                            return (
                                <SubMenu title={description} key={id}>
                                    {
                                        subMenu.map(sub => (
                                            <MenuItem key={`${id}/${sub.id}`}>{sub.description}</MenuItem>
                                        ))
                                    }
                                </SubMenu>
                            );
                        } else return (
                            <MenuItem key={id}>{description}</MenuItem>
                        );
                    }
                )}
            </Menu>
        );

        return (
            <Dropdown
                trigger={['click']}
                overlay={<div style={{width: 200, backgroundColor: 'white'}}>{menu}</div>}
                onVisibleChange={this.onVisibleChange.bind(this)}
                visible={this.state.visible}
                defaultActiveFirst
                overlayClassName="overlays-dropdown">
                <span className='filter' title='Thematic Analysis'>Thematic Analysis&ensp;▾</span>
            </Dropdown>
        )
    }


}

const options = [
    {
        id: 'fspug',
        description: 'Financial Services Uganda',
        subMenu: [
            {
                id: 'qn1',
                description: 'Mobile Money Agents'
            },
            {
                id: 'qn2',
                description: 'Distance from Banks/ATMs'
            },
            {
                id: 'qn3',
                description: 'Distribution of Banks'
            },
            {
                id: 'qn4',
                description: 'Distribution of FSPs'
            }
        ]
    },
    {
        id: 'fspkenya',
        description: 'Financial Services Kenya'
    }
];

export default FSPMenu