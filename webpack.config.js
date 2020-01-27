const path = require('path');

module.exports = {
	entry: {
		main: './src/script.js'
	},
	output: {
		filename: 'script.js',
		path: path.join(__dirname, '/extension')
	},
	mode: 'development'
};
