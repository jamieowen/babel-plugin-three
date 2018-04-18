const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require('path');

const babelPluginThree = path.resolve( __dirname, '../' );


const moduleResolverOpts = {
    root: path.join( __dirname, '../' ),
    extensions: [ '.js' ],
    alias: {
        three: './three.js'
    }
}

module.exports = {

    mode: 'development',

    entry: {
        effectscomposer: path.resolve( __dirname, './effects-composer.js' )
    },

    devtool: 'inline-source-map',
    devServer: {

    },

    output: {
        filename: '[name].bundle.js',
        path: path.join( __dirname, 'build' )
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'babel-plugin-three / effect-composer'
        })
    ],    

    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [                                                        
                            [ 'module-resolver', moduleResolverOpts, 'pass-1' ], // required to resolve three to three.js gitsubmodule. ( no module resolution is needed in regular 'three' npm install )
                            [ babelPluginThree, {} ],
                            [ 'module-resolver', moduleResolverOpts, 'pass-2' ] // second pass, resolves babel-plugin-three transformations. ( no module resolution is needed in regular 'three' npm install )
                        ]
                    }
                }
            }
        ],
    }    
};