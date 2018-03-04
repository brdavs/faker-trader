const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const os =  require('os')
const path = require('path')


const env = (env) => {
	return process.env.NODE_ENV == env
}

/**
 * COMMON CONFIG
 */
let conf = {
	entry: './src/index.js',
	output: {
        path: __dirname + '/www',
		filename: 'assets/[name].js', //'[name]-[hash].js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.jsx$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.yaml$/,
				use: [
					{loader: 'json-loader'},
					{loader: 'yaml-loader'}
				],
			},
			{
				test: /\.(png|jpg|gif|svg|svg|json)$/,
				loader: 'url-loader'
			},
			{
				test: /\.s?css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader']
				})
			},
		]
	},
	plugins: [
		new CopyWebpackPlugin([ { from: 'src/assets', to: 'assets' } ]),
		new ExtractTextPlugin("assets/[name].css"), // new ExtractTextPlugin("[name]-[hash].css"),
		new HtmlWebpackPlugin({
			title: 'Faker trader 0.1',
			template: `${__dirname}/src/index.html`
		})
	]
};

/**
 * DEVELOPMENT SPECCIFFIC
 */

const conf_dev = {
	devtool: 'source-map',
	devServer: {
		contentBase: './',
		port: 8080,
		noInfo: false,
		hot: true,
		inline: true,
		proxy: {
			'/api/*': {
				target: 'http://localhost:8000',
			},
			'/': {
				target: 'http://localhost:8080/index.html',
				pathRewrite: { '/.*': '' }
			},
		}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
	],
	devtool: 'inline-source-map'

}

/**
 * PRODUCTION SPECIFFIC CLIENT SIDE
 */
const conf_prod = {
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: false },
			comments: false,
			sourceMap: false
		})
	]
}




/**
 * EXPORTS
 */
const merge = require('webpack-merge')

// For development vs production
let merged_conf = env('development') ? merge(conf, conf_dev) : merge(conf, conf_prod)


module.exports = merged_conf

// if(process.env.NODE_ENV == 'development') conf.plugins.push(new webpack.HotModuleReplacementPlugin())
// if(process.env.NODE_ENV == 'development') conf.devtool = 'inline-source-map'

// module.exports = conf