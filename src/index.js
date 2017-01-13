const R = require('ramda')

function addHandlers(componentInstance, { changeState } = {}) {
	const setState = componentInstance.setState.bind(componentInstance)
	const evolveState = R.pipe(
		R.evolve,
		setState
	)

	componentInstance.handleValue = R.memoize((stateProp) => (value) => {
		setState({
			[stateProp]: value
		})
	})

	componentInstance.handleEvent = R.memoize((stateProp, eventPath = ['target', 'value']) => (value) => {
		setState({
			[stateProp]: R.path(eventPath, value)
		})
	})

	componentInstance.handleKeyValuePair = R.memoize((stateProp) => (key, value) => {
		evolveState({
			[stateProp]: R.merge(R.__, {
				[key]: value
			})
		})
	})

	componentInstance.handleArrayProp = R.memoize((stateProp, key) => (index, value) => {
		evolveState({
			[stateProp]: R.adjust(
				R.assoc(key, value),
				index
			)
		})
	})

	// Custom changeState handlers
	R.forEach(
		R.pipe(
			R.toPairs, // Array of key-value pairs
			R.forEach(
				([methodName, handler]) => {
					// Assign handler method
					componentInstance[methodName] = R.pipe(
						(handler.length === 1) ? R.always(handler) : R.curry(handler),
						setState
					)
				}
			)
		),
		[].concat(changeState) // Ensure array
	)
}

module.exports = {
	addHandlers
}
