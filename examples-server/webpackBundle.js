
const webpack = require( 'webpack' );
const path = require( 'path' );
const pluginPath = path.resolve( __dirname, '../' );
const MemoryFS = require( 'memory-fs' );
const { ResolverFactory } = require('enhanced-resolve');

const memfs = new MemoryFS();

const EntrySourceResolver = ResolverFactory.createResolver({
    fileSystem: memfs,
    extensions: ['.js.memory' ]
});


module.exports = function( entrySource ){

    console.log( 'WebPack :', entrySource );

    // https://github.com/webpack-contrib/val-loader

    // memfs.writeFileSync( 'entry.js', entrySource, 'utf-8' );
    const entryPlugin = new EntrySourcePlugin();

    const compiler = webpack({
        entry: {
            app: 'entry.js.memory'
        },  
        output: {
            path: '/',
            filename: 'output.js'
        },
        plugins: [
            entryPlugin
        ]
    });

    // compiler.inputFileSystem = fs;
    // compiler.outputFileSystem = fs;
    // compiler.resolvers.normal.fileSystem = fs;
    // compiler.resolvers.context.fileSystem = fs;

    compiler.run( (err, stats) => {

        if (err || stats.hasErrors()) {
            // Handle errors here
            console.log( 'ERROR', err, Object.keys( stats ) );
        }
        // Done processing
        console.log( 'Done...' );

    });

    return '';

}