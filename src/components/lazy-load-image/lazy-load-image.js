import React, { Component } from 'react';

class LazyLoadImage extends Component {
	componentDidMount() {
		this.createObserver();
	}

	createObserver() {
		const component = this;
		const config = {
			rootMargin: '100% 0px'
		};

		let observer = new IntersectionObserver(function (entries, self) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					component.preloadImage(entry.target);
					observer.unobserve(entry.target);
				}
			});
		}, config);

		observer.observe(this.element);
	}

	preloadImage(img) {
		const src = img.getAttribute('data-src');
		if (!src) { return; }
		img.src = src;
	}

	render() {
		return (
			<img data-src={this.props.src} alt={this.props.alt} ref={(e) => this.element = e} />
		);
	}
}

export default LazyLoadImage;
