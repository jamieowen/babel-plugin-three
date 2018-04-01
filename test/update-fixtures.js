
/**
 * Copy some target example files from the three.js folder.
 * Run to update when versions update.
 * 
**/

var fs = require( 'fs-extra' );
var path = require( 'path' );

var root = path.resolve( __dirname, '../../' );

console.log( 'ROOT', root );

var fixtures = [
    '/three.js/examples/js/controls/OrbitControls.js',
    '/three.js/examples/js/postprocessing/EffectComposer.js',
    '/three.js/examples/js/postprocessing/UnrealBloomPass.js'
];

fixtures.forEach( ( example )=>{

    // Convert path to /folder/file-name/FileName.js

    var filename = example.split( '/' );
    filename = filename[ filename.length - 1 ]; 
    var folder = filename.replace( '.js', '' ).match(/[A-Z][a-z]+/g).join( '-' ).toLowerCase();

    var outputFolder = path.join( __dirname, 'fixtures', folder );
    var outputFile = path.join( outputFolder, filename );
    var sourceFile = path.join( root, example );    

    fs.mkdirsSync( outputFolder );
    fs.copySync( sourceFile, outputFile );

} );

