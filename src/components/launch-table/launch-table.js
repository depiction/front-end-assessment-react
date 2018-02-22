import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import orderBy from 'lodash/orderBy';

import LazyLoadImage from '../lazy-load-image/lazy-load-image';

import './launch-table.css';

class LaunchTable extends Component {
	constructor(props) {
		super(props);

		this.state = {
			launches: [],
			filteredLaunches: [],
			showNotification: false,
			sortOrder: 'desc',
			loaded: false,
			serviceError: false,
			filterOptions: [
				{
					name: 'Land Success',
					value: 'launch_success'
				},
				{
					name: 'Reused',
					value: 'reused'
				},
				{
					name: 'With Reddit',
					value: 'reddit'
				}
			],
			checkedFilters: []
		}

		this.toggleSort = this.toggleSort.bind(this);
		this.updateFilters = this.updateFilters.bind(this);
	}

	componentDidMount() {
		this.getLaunches();
	}

	getLaunches(notify = false) {
		axios.get('https://api.spacexdata.com/v2/launches')
			.then(res => {
				this.setState({
					loaded: true,
					launches: orderBy(res.data, 'launch_date_local', this.state.sortOrder),
					showNotification: (notify) ? true : false
				})

				if (notify) {
					setTimeout(() => {
						this.setState({
							showNotification: false
						});
					}, 1500);
				}
			})
			.catch(e => {
				this.setState({
					serviceError: true
				})
			})
	}

	toggleSort () {
		let sortOrder = (this.state.sortOrder === 'asc') ? 'desc' : 'asc';

		this.setState({
			sortOrder: sortOrder,
			launches: orderBy(this.state.launches, 'launch_date_local', sortOrder)
		})
	}

	updateFilters(option, event) {
		let checkedFilters = this.state.checkedFilters;

		if (event.target.checked) {
			checkedFilters.push(option.value);
		} else {
			this.state.filterOptions.forEach((item, index) => {
				if (checkedFilters[index] === option.value) {
					checkedFilters.splice(index, 1);
				}
			})
		}

		this.setState({
			checkedFilters: checkedFilters,
			filteredLaunches: this.filter(this.state.launches, checkedFilters)
		})

	}

	filter (launches, checkedFilters) {
		if(checkedFilters.length) {
			return launches.filter(launch => {
				let matches = [];

				for(let filter of checkedFilters) {
					if(filter === 'launch_success') {
						if(launch.launch_success) {
							matches.push(true);
						}
					}

					if(filter === 'reused') {
						if(Object.values(launch.reuse).includes(true)) {
							matches.push(true);
						}
					}

					if(filter === 'reddit') {
						// convert links object keys into an array
						const links = Object.keys(launch.links);
						let match;

						// set match to true if launch has at least one reddit link prop that isn't null
						for(let link of links) {
							if(link.search(/reddit/i) === 0) {
								if(launch.links[link] != null) {
									match = true;
								}
							}
						}

						if(match) {
							matches.push(true);
						}
					}
				}

				return (matches.length === checkedFilters.length);
			});
		} else {
			return null;
		}
	}

	render() {
		let message = null;
		let showing = null;
		let launches = (this.state.filteredLaunches && this.state.filteredLaunches.length) ? this.state.filteredLaunches : this.state.launches;

		if(this.state.loaded && !this.state.launches.length && !this.state.serviceError) {
			message = <p className="message">No launches found.</p>
		} else if(this.state.serviceError) {
			message = <p className="message error">Error getting launch data.</p>
		}

		if(launches.length !== this.state.launches.length) {
			showing = <span>Showing {launches.length} of </span>
		}

		return (
			<div>
				{message ? message : (
					<div>
						<div className="table-actions">
							<button type="button" className="refresh" onClick={() => this.getLaunches(true)}>Refresh</button>
							<p className={"notification " + (this.state.showNotification ? 'show' : '')}>Updated</p>
							<form className="filters">
								{this.state.filterOptions.map((option, value) => (
									<label className="custom-checkbox" key={option.value}>
										<input type="checkbox" value={option.value} onChange={(e) => this.updateFilters(option, e)} />{option.name}
										<span className="checkmark"></span>
									</label>
								))}
							</form>
							<p className="showing">
								{showing}
								{this.state.launches.length} launches</p>
						</div>

						<table className="launch-table">
							<thead>
								<tr>
									<th>Badge</th>
									<th>Rocket Name</th>
									<th>Rocket Type</th>
									<th className={'launch-date ' + this.state.sortOrder} onClick={this.toggleSort}>Launch Date</th>
									<th>Details</th>
									<th>ID</th>
									<th>Article</th>
								</tr>
							</thead>
							<tbody>
								{launches.map((launch, flight_number) => (
									<tr key={launch.flight_number}>
										<td data-label="Badge" className="badge">
											<LazyLoadImage src={launch.links.mission_patch} alt={launch.rocket.rocket_name} />
										</td>
										<td data-label="Rocket Name">{launch.rocket.rocket_name}</td>
										<td data-label="Rocket Type">{launch.rocket.rocket_type}</td>
										<td data-label="Launch Date" className="launch-date">{moment(launch.launch_date_local).format('MM/DD/YYYY')}</td>
										<td data-label="Details">
											<span className="ellipsis"><span>
												{launch.details}
											</span></span></td>
										<td data-label="ID">{launch.flight_number}</td>
										<td data-label="Article" className="article">
											{launch.links.article_link && (
												<a className="link" href={launch.links.article_link} target="_blank">
													Link
												</a>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		);
	}
}

export default LaunchTable;
