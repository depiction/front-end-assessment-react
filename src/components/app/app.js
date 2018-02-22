import React, {
	Component
} from 'react';

import LaunchTable from '../launch-table/launch-table';
import '../../scss/styles.css';

class App extends Component {
	constructor() {
		super();

		this.state = {
			title: 'SpaceX Launches'
		}
	}

	render() {
		return (
			<div id="app" className="page-wrapper">
			<header>
				<h1>{this.state.title}</h1>
			</header>

			<LaunchTable />

			<div className="rocket"></div>
		</div>
		);
	}
}

export default App;
