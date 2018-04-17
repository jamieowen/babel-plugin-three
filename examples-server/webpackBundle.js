const webpack = require( 'webpack' );
const path = require( 'path' );
const createEntrySource = require( './createEntrySource' );
const valLoader = require( 'val-loader' );
const MemoryFS = require( 'memory-fs' );

const pluginPath = path.resolve( __dirname, '../' );

const fs = new MemoryFS();

module.exports = function( jsUrl, exampleSrcPaths ){

    return new Promise( ( resolve,reject )=>{

        const outputFilename = jsUrl.replace( /\//g, '_' );

        // Todo: Cache Result?

        const compiler = webpack({

            mode: 'development',
            entry: {
                app: require.resolve( './createEntrySource' )
            },  
            output: {
                path: '/',
                filename: outputFilename
            },
            plugins: [],
            module: {
                rules: [
                    { 
                        test: require.resolve( './createEntrySource' ),
                        use: [ { 
                            loader: 'val-loader',
                            options: {
                                exampleSrcPaths: exampleSrcPaths
                            }
                        } ]
                    },
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: [ 

                                    // [ pluginPath, {} ],
                                    [ 'module-resolver', {
                                        root: [ '../' ],
                                        alias: {
                                            three: './three.js'
                                        }
                                    } ]
                                ]
                            }
                        }
                    }
                ]
            }
        });
        
        console.log( Object.keys( compiler ) );
        compiler.outputFileSystem = fs;

        compiler.run( (err, stats) => {

            if( err || stats.hasErrors() ) {

                console.log( 'Webpack error.' );

                if( stats ){
                    console.log( 'Error ', stats.compilation.errors );
                    reject( stats.compilation.errors );
                }else{
                    reject( err );
                }

            }else{

                resolve( fs.readFileSync( '/' + outputFilename, 'utf-8' ) );
                
            }

        });


    })
    

}