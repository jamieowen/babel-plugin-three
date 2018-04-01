/**
 * 
 * As a preliminary step, transform and traverse all js files
 * found in three.js/examples and store all AST node types referring to 'THREE'
 * 
 * Build index of these and export as JSON.
 * 
 */

var babel = require( 'babel-core' );
var babylon = require( 'babylon' );
var glob = require( 'glob' );
var fs = require( 'fs' );
var path = require( 'path' );

var THREE = require( '../three.js/build/three' );

var examplesJs = glob.sync( '../three.js/examples/js/**/*.js', {
    ignore: [ '../three.js/examples/js/libs/**/*.*' ]
} );
var currentIndex = 0;
examplesJs = examplesJs.splice( 0,50 );
// var examplesJs = [ '../three.js/examples/js/controls/OrbitControls.js' ];
var nodePaths = {};
var errors = {};
var pathAncestory = {};

var addPathAncestory = ( trail )=>{

    const id = trail.join( '/' );
    let p = pathAncestory[ id ];
    if( !p ){
        p = pathAncestory[id] = { count: 0 };
    }
    p.count++;

}


var step = function(){

    if( currentIndex < examplesJs.length ){

        var current = examplesJs[ currentIndex++ ];

        console.log( `${currentIndex}/${examplesJs.length}`, current );

        var nodePathRef = nodePaths[ current ] = {
            id: currentIndex,
            file: current,
            stats:{},
            globalRefs: {},
            localRefs: {},
            // exampleRefs: {} // possible linking to example classes?
        }

        var addRef = ( property, trail )=>{

            let ref,map;
            
            if( THREE[property] ){
                map = nodePathRef.globalRefs;
            }else{
                map = nodePathRef.localRefs;
            }

            ref = map[ property ];
            if( !ref ){
                ref = map[ property ] = { name: property };
            }

            ref.count = isNaN( ref.count ) ? 1 : ref.count+1;
        }

        var tracePath = ( path, depth )=>{

            var trail = [ path.node.type ];
            var parent = path.parentPath;
            var c = 0;
            while( ++c < depth && parent ){
                trail.unshift( parent.node.type );
                parent = parent.parentPath;
            }
            return parent;

        }

        var code = fs.readFileSync( current, { encoding: 'utf8' } );
        var ast = babylon.parse( code );      

        babel.traverse( ast, {

            Identifier( path ){

                if( path.node.name === 'THREE' ){

                    // MemberExpression
                    var parent = path.parentPath;
                    // // console.log( parent.parentPath.type );

                    var trail = tracePath( path );
                    // addPathAncestory( trail ); // <<< HERE ----------

                    // let p = [];
                    // while( parent.parentPath.type !== 'Program' ){
                    //     p.unshift( parent.type );
                    //     parent = parent.parentPath;
                    // }
                    // // console.log( p.join(',') );
                    // parent = path.parentPath;
                    if( parent.type === 'MemberExpression' ){

                        addRef( parent.node.property.name );                        

                    }else{

                        // console.log( 'Not MemberExpression :', parent.type, p.join(',') );

                        errors[ current ] = errors[ current ] || {
                            nonMemberExpression: []
                        };

                        errors[ current ].nonMemberExpression.push( {
                            file: current,
                            parentType: parent.type
                        } )
                    }
                    
                }
            }
        })

        const res = babel.transformFromAst( ast );
        fs.writeFileSync( path.join( __dirname, './test.gen.js' ), res.code, { encoding: 'utf8' } );
        step();

    }else{
        
        console.log( 'Done' );

        fs.writeFileSync( 
            path.join( __dirname, './node-paths.json' ), 
            JSON.stringify( { errors, pathAncestory, nodePaths }, null, 4 ), 
            { encoding: 'utf8' } 
        );

    }

}

step();