
var path = require( 'path' );
var glob = require( 'glob' );
var babel = require( 'babel-core' );

var fixtures = glob.sync( 'fixtures/**/!(*.actual|*.expected).js', {
    cwd: __dirname
} );

fixtures = fixtures.splice(0,1);

var pluginPath = path.resolve( __dirname, '../' );

console.log( 'PluginPath ', pluginPath );

var runTest = function( file ){

    const source = path.resolve( 'test', file );
    const expected = path.resolve( 'test', file.replace( '.js', '.expected.js' ) );
    const actual = path.resolve( 'test', file.replace( '.js', '.actual.js' ) );

    return Promise.resolve().then( ()=>{

        // Transform source.

        return new Promise( ( resolve,reject )=>{

            babel.transformFile( source, {
    
                plugins: [ pluginPath ]
    
            }, ( err, result )=>{
    
                if( err ){
                    reject(err);
                }else{
                    resolve( result );
                }                        
    
            } )
    
        })

    })
    .then( ( ast )=>{

        // Write actual.

        return new Promise( ( resolve,reject )=>{

            console.log( 'Write:', Object.keys( ast ) );
            resolve( ast );

        });
        
    }).then( ()=>{

        // Compare expected.

        console.log( 'Compare' );

    })
    
}

var step = ()=>{

    var testFile = fixtures.shift();
    
    runTest( testFile )
        .then( ()=>{

            if( fixtures.length ){
                step();
            }else{
                done();
            }
            
        } )
        .catch( ()=>{
            step();
        })


}

var done = ()=>{

    console.log( 'done' );

}

var start = ()=>{

    step();

}

start();
