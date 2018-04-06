
/**
 * Builds an index of classes defined either on the three.js build or
 * found as definitions in the examples folder.
 * 
 * This will launch the babel-three-plugin with additional env options which
 * will write 
 */
var path = require( 'path' );
var babel = require( 'babel-core' );
var fs = require( 'fs' );
var globExamples = require( './globExamples' );

var threePath;
var indexPath = path.resolve( __dirname, '../src/three-class-index.json' );

try{
    threePath = require.resolve( 'three' );
    console.log( 'Using resolved three.js module.' );
}catch( error ){
    threePath = path.resolve( __dirname, '../three.js' );
    console.log( 'Using presumably checked out three.js git submodule' );
}

var three = require( threePath );
var package = require( path.resolve( threePath, 'package.json' ) );

var threeMap = {};
Object.keys( three ).forEach( ( key )=>{
    threeMap[ key ] = true;
});

var examplesMap = {};

var examples = globExamples( threePath );
examples.forEach( ( ex )=>{

    var basename = path.basename( ex );

    examplesMap[ basename ] = {
        path: ex        
    }

})

examples = examples.slice( 0,4 );

// Write file initially - The babel pass will analyse the contents for imports/exports.

var indexData = {
    VERSION: package.version,
    three: threeMap,
    examples: examplesMap
}

fs.writeFileSync( indexPath, JSON.stringify(indexData, null, 4 ) );

// Initialise some environent vars so the plugin will output metadata.
process.env[ 'BABEL_THREE_INDEX' ] = true;
process.env[ 'BABEL_THREE_INDEX_PATH' ] = indexPath;
process.env[ 'BABEL_THREE_PATH' ] = threePath;

var pluginPath = path.resolve( __dirname, '../' );
var currentExample = 0;
var step = function(){
    
    if( currentExample === examples.length-1 ){
        done();
        return;
    }

    var source = examples[ currentExample++ ];
    console.log( `${currentExample}/${examples.length}`, source );

    babel.transformFile( path.resolve( threePath, source ), {
        plugins: [ pluginPath ]
    }, ( err, result )=>{

        if( err ){
            throw err;
        }
        
        step();

    } )    

}

var done = function(){

    console.log( 'DONE' );
}

var start = function(){

    step();
}

start();











