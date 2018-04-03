
module.exports = function babelPluginThree( babel ){

    const t = babel.types;

    return {

        visitor: {

            Program: {

                enter: ( path, state )=>{
                    
                    state.pluginThree = {
                        imports: [],
                        exports: []
                    }

                },
                exit: ( path, state )=>{

                try{

                    let exports = [];
                    let exportDefault = null;
                    state.pluginThree.exports.forEach( (ex)=>{
                        if( state.file.opts.filename.indexOf( ex ) > -1 ){
                            exportDefault = ex;
                        }else
                        if( exports.indexOf(ex) === -1 ){
                            exports.push( ex );
                        }
                    });

                    // TODO : Need to resolve imports to either three module or a local example file reference.
                    let imports = [];
                    state.pluginThree.imports.forEach( (im)=>{
                        if( imports.indexOf(im) === -1 && exports.indexOf(im) === -1 && im !== exportDefault ){
                            imports.push( im );
                        }
                    } );

                    imports = imports.map( ( im )=>{
                        return t.importSpecifier( t.identifier( im ), t.identifier( im ) );
                    });

                    exports = exports.map( ( ex )=>{
                        return t.exportSpecifier( t.identifier( ex ), t.identifier( ex ) );                        
                    } );

                    path.unshiftContainer( 'body',
                        t.importDeclaration( imports, t.stringLiteral( 'three' ) )
                    )              

                    path.pushContainer( 'body',
                        t.exportNamedDeclaration( null, exports )
                    )                                  
                    
                    if( exportDefault ){
                        path.pushContainer( 'body', 
                            t.exportDefaultDeclaration( t.identifier( exportDefault ) )
                        )
                    }


                }catch( error ){
                    console.log( error );
                } 

                }

            },

            Identifier: {

                enter: ( path, state )=>{

                    if( path.node.name === 'THREE' ){
                        
                        if( t.isMemberExpression( path.parentPath ) ){

                            const usage = path.parentPath.parentPath;

                            if( t.isProgram( usage.getFunctionParent() ) && t.isAssignmentExpression( usage ) ){
                                    
                                // Top level assigment expressions - treat as either class or constant declarations and export.
                        
                                console.log( 'OK' );
                                state.pluginThree.exports.push( 
                                    path.parentPath.node.property.name
                                );
                                
                                try{
                                    // usage.replaceWith( 
                                    //     t.variableDeclarator( t.identifier( 'OKOK' ), usage.node.right )
                                    // );
                                }catch( err ){
                                    console.log( err );
                                }



                            }else{

                                state.pluginThree.imports.push( 
                                    path.parentPath.node.property.name
                                );

                                path.parentPath.replaceWith( path.parentPath.node.property );
                                
                            }

                        }else{
                            
                            throw new Error( `Handling THREE[] MemberExpressions only. Something's not right..` );

                        }

                    }
                }

            }

        }

    }

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
