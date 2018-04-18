
/**
 * Copy some target example files from the three.js folder.
 * Run to update when versions update.
 * 
**/

var fs = require( 'fs-extra' );
var path = require( 'path' );

var root = path.resolve( __dirname, '../../' );

var fixtures = [
    '/three.js/examples/js/controls/OrbitControls.js',
    '/three.js/examples/js/controls/TransformControls.js',
    '/three.js/examples/js/postprocessing/EffectComposer.js',
    '/three.js/examples/js/postprocessing/UnrealBloomPass.js',
    '/three.js/examples/js/shaders/CopyShader.js',
    '/three.js/examples/js/shaders/FXAAShader.js',
    '/three.js/examples/js/shaders/LuminosityHighPassShader.js',
    '/three.js/examples/js/loaders/OBJLoader.js',
    '/three.js/examples/js/postprocessing/MaskPass.js'

];

const isUpperCase = function( s ){
    return s.toUpperCase() === s;
}

fixtures.forEach( ( example )=>{

    // Convert path to /folder/file-name/FileName.js

    var filename = example.split( '/' );
    filename = filename[ filename.length - 1 ]; 
    
    var folderPrepName = filename;
    // fix cases like FXAAShader resulting in just "shader" folder name. So FXAAShader = fxaa-shader.
    if( isUpperCase(filename[0]) && isUpperCase(filename[1] ) ){
        var lastUpper = -1;
        var chars = folderPrepName.split( '' ).map( (c,i)=>{
            if( isUpperCase(c) && i === 0 ){
                lastUpper = i;
                return c;
            }else
            if( isUpperCase(c) && lastUpper === i-1 ){
                lastUpper = i;
                if( i < folderPrepName.length-1 && !isUpperCase( folderPrepName[i+1] ) ){
                    return c;
                }else{
                    return c.toLowerCase();
                }
                
            }else{
                return c;
            }
        })
        folderPrepName = chars.join('');
    }

    var folder = folderPrepName.replace( '.js', '' ).match(/[A-Z][a-z]+/g).join( '-' ).toLowerCase();
    

    var outputFolder = path.join( __dirname, 'fixtures', folder );
    var outputFile = path.join( outputFolder, filename );
    var sourceFile = path.join( root, example );    

    fs.mkdirsSync( outputFolder );
    fs.copySync( sourceFile, outputFile );

} );

