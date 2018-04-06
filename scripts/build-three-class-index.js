
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
var chalk = require( 'chalk' );

var message = {
    warning: chalk.red,
    info: chalk.blue,
    detail: chalk.white,
    error: chalk.red,
    done: chalk.yellow
}

var threePath;
var indexPath = path.resolve( __dirname, '../src/three-class-index.json' );

try{
    threePath = require.resolve( 'three' );
    console.log( message.info( 'Using resolved three.js module.' ) );
}catch( error ){
    threePath = path.resolve( __dirname, '../three.js' );
    console.log( message.info( 'Using presumably checked out three.js git submodule' ) );
}

var three = require( threePath );
var package = require( path.resolve( threePath, 'package.json' ) );

var threeMap = {};
Object.keys( three ).forEach( ( key )=>{
    threeMap[ key ] = true;
});

var examplesPaths = {};

var examples = globExamples( threePath );
examples.forEach( ( ex )=>{
    examplesPaths[ ex ] = 1;
})

// examples = examples.slice( 0,10 );

// Write file initially - The babel pass will analyse the contents for imports/exports.

var indexData = {
    VERSION: package.version,
    three: threeMap,
    examplesPaths: examplesPaths,
    examplesClasses: {}
}

fs.writeFileSync( indexPath, JSON.stringify(indexData, null, 4 ) );

// Initialise some environment vars so the plugin will output metadata.
process.env[ 'BABEL_THREE_INDEX' ] = true;
process.env[ 'BABEL_THREE_INDEX_PATH' ] = indexPath;
process.env[ 'BABEL_THREE_PATH' ] = threePath;

var pluginPath = path.resolve( __dirname, '../' );
var currentExample = 0;

/**
 * step()
 */
var step = function(){

    if( currentExample === examples.length-1 ){
        done();
        return;
    }

    var source = examples[ currentExample++ ];

    console.log( message.detail( `${currentExample}/${examples.length}` ), message.info( source ) );

    babel.transformFile( path.resolve( threePath, source ), {
        plugins: [ pluginPath ]
    }, ( err, result )=>{

        if( err ){
            throw err;
        }
        
        step();

    } )    

}

/**
 * done()
 */
var done = function(){

    /**
     * The index needs to be reconfigured to determine
     * local imports vs three module imports.
     */

    var index = JSON.parse( fs.readFileSync( indexPath ) );

    var imports,exports,exampleImports;
    var newEntry,oldEntry,ex;
    for( var path in index.examplesPaths ){

        oldEntry = index.examplesPaths[ path ];
        newEntry = Object.assign( {}, oldEntry, { 
            imports: [], 
            importsThree: [] 
        } );            
        
        if( oldEntry.imports ){

            oldEntry.imports.forEach( (ex)=>{
                if( three[ ex ] ){
                    newEntry.importsThree.push( ex );
                }else{
                    newEntry.imports.push( ex );
                }
            })

        }
       
        index.examplesPaths[ path ] = newEntry;

        if( newEntry.exports ){

            newEntry.exports.forEach( (exClass)=>{
                index.examplesClasses[ exClass ] = path;
            });

        }else{

            newEntry.exports = [];
        
        }

        if( newEntry.exports.length === 0 ){
            console.log( message.warning( 'No exports found in example : %s', path ) );
        }

    }

    fs.writeFileSync( indexPath, JSON.stringify( index, null, 4 ) );

    console.log( message.done( 'Exported..' ) );

}

/**
 * start()
 */
var start = function(){

    step();

}

start();











