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

// var examplesJs = glob.sync( '../three.js/examples/js/**/*.js' );
var examplesJs = [ '../three.js/examples/js/controls/OrbitControls.js' ];
console.log( examplesJs );

console.log( examplesJs.length );

console.log( Object.keys( babel ) );

var step = function(){

    console.log( 'setp' );
    if( examplesJs.length > 0 ){

        var current = examplesJs.pop();

        console.log( current );

        var code = fs.readFileSync( current, { encoding: 'utf8' } );
        var ast = babylon.parse( code );

        babel.traverse( ast, {

            enter(path){
                // console.log( path.type, path.node.name );

                if( path.node.name === 'THREE' ){
                    // console.log( path.node.type, path.type );
                    // console.log( Object.keys( path.node ) );
                    //count++;
                }


            },

            Program:{

                enter( path ){

                    console.log( 'enter' );

                },

                exit( path ){

                    console.log( 'exit' );

                }

            },           

            Identifier( path ){

                if( path.node.name === 'THREE' ){

                    // console.log( 'Shizzle', path.getStatementParent().type, path.getFunctionParent().type );
                    console.log( 'TT', path.parentPath.type );
                    // MemberExpression
                    var parent = path.parentPath;
                    if( parent.type === 'MemberExpression' ){
                        
                        console.log( 'statement parent :', path.getStatementParent().type );
                        console.log( 'parent type : ', parent.type );
                        // console.log( parent.node.property.name );

                        console.log( babel.transformFromAst( parent ) );
                    }
                    
                }
            }
        })

        // step();

    }else{

        console.log( 'Done' );

    }

}

step();