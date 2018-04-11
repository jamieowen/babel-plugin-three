
var path = require( 'path' );
var fs = require( 'fs' );
var glob = require( 'glob' );
var babel = require( 'babel-core' );

var fixtures = glob.sync( 'fixtures/**/!(*.actual|*.expected).js', {
    cwd: __dirname
} );

// fixtures = fixtures.splice(0,1);

var pluginPath = path.resolve( __dirname, '../' );

var runTest = function( file ){

    const source = path.resolve( 'test', file );
    const expected = path.resolve( 'test', file.replace( '.js', '.expected.js' ) );
    const actual = path.resolve( 'test', file.replace( '.js', '.actual.js' ) );

    return Promise.resolve().then( ()=>{

        // Transform source.

        return new Promise( ( resolve,reject )=>{

            console.log( '>>>>>', file );
            
            babel.transformFile( source, {
                plugins: [ 
                    pluginPath
                ]
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

            fs.writeFile( actual.toString(), ast.code, {
                encoding: 'utf8' 
            }, ( err,res )=>{

                if( err ){
                    reject(err);
                }else{
                    resolve();
                }

            });

        });
        
    }).then( ()=>{

        // Compare expected.

        console.log( 'Compare', file );        

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

    console.log( 'Done...' );

}

var start = ()=>{

    step();

}

start();
