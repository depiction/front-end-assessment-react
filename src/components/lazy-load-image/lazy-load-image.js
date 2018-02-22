import React, { Component } from 'react';
import ReactDom from 'react-dom';

class LazyLoadImage extends Component {
	componentDidMount() {
		this.createObserver();
	}

	createObserver() {
		const component = this;
		const element = ReactDom.findDOMNode(component);
		const config = {
			rootMargin: '100% 0px'
		};

		let observer = new IntersectionObserver(function (entries, self) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					component.preloadImage(element);
					observer.unobserve(element);
				}
			});
		}, config);

		observer.observe(element);
	}

	preloadImage(img) {
		const src = img.getAttribute('data-src');
		if (!src) { return; }
		img.src = src;
	}

	render() {
		return (
			<img data-src={this.props.src} alt={this.props.alt} />
		);
	}
}

export default LazyLoadImage;
