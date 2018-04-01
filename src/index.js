

module.exports = ( {types:t } )=>{


}

// Remove all member expressions 
// and replace with the parent property identifier

// put the parent property identifier in a hash map
// to build the import statements.

// ignore any THREE.Object variable declarations that exist
// in the top level ( Program Node? ).  OR if we build a map of all classes
// found in three.js global THREE object, we can check for its
// existence first and fall back to that, otherwise we assume
// we are creating and exporting it from this file.
// one drawback is refs to example added classes from within this file.

// if a variable declares a function and has a member name of THREE
// we assume that is the default function/class being exported.

// anything else is assumed to be a constant exported to THREE.

// console.log( babel.transformFromAst( parent ) );


/**
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

                    // console.log( 'enter' );

                },

                exit( path ){

                    // console.log( 'exit' );
                    // console.log( referenceMap );

                }

            },           

            ExpressionStatement( path ){

                // console.log( 'EXPRE : ', path.node.expression.type );

            },
 */