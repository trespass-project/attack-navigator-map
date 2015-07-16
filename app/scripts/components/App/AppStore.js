var flummox = require('flummox');
var mout = require('mout');
var trespass = require('trespass.js');


class AppStore extends flummox.Store {

	constructor(flux, name) {
		super();

		const appActionIds = flux.getActionIds(name);
		this.register(appActionIds.loadModel, this.loadModel);
		this.register(appActionIds.modelAdd, this.modelAdd);

		this.state = {
			model: null
		};
	}


	loadModel(action) {
		var that = this;

		that.setState({
			loading: true,
			error: null
		});

		action.promise
			.success(function(data, status, jqXHR) {
				var $system = trespass.model.parse(data)('system');
				var model = trespass.model.prepare($system);
				that.setState({ model: model });
			})
			.error(function(jqXHR, status, errorMessage) {
				console.error(status, errorMessage);
				that.setState({
					error: {
						status,
						errorMessage
					}
				});
			})
			.always(function() {
				that.setState({ loading: false });
			});
	}


	modelAdd(action) {
		const {type, data} = action;
		let method = 'add'+mout.string.pascalCase(type);
		if (!mout.object.has(trespass.model, method)) {
			method = 'add_';
		}
		let model = trespass.model[method](this.state.model, data);
		this.setState({ model: model });
	}

};


module.exports = AppStore;
