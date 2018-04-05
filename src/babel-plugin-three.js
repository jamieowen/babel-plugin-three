
module.exports = function babelPluginThree( babel ){

    const t = babel.types;

    console.log( 'STARTUP PLUGIN' );
    // var three = require( 'three' );
    // console.log( three );

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
                            exports.push( ex ); // export default using { ClassName } as well ?
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

                            console.log( 'Usage Node :', usage.type, Object.keys( usage.node ) );
                            console.log( 'Parent Info', usage.parentPath.type, usage.parentPath.parentPath.type );

                            // This is essentially handling any top level THREE.OrbitControls = function(){...}
                            // declarations.  Converting them to exports
                            // TODO : There are some cases where an example is wrapped entirely in a self-executing function closure. ( i.e. TransformControls )
                            if( t.isProgram( usage.getFunctionParent() ) 
                                && t.isFunctionExpression( usage.node.right )
                                && t.isAssignmentExpression( usage ) 
                                && t.isExpressionStatement( usage.parentPath ) 
                            ){
                                                            
                                state.pluginThree.exports.push( 
                                    path.parentPath.node.property.name
                                );
                                
                                try{                                    
                                    // Produces strange output when replacing the AssignmentExpression, so replace the ExpressionStatement.
                                    // https://github.com/babel/babel/issues/5072
                                    usage.parentPath.replaceWith( 
                                            t.variableDeclaration( "const", [
                                                t.variableDeclarator( 
                                                    t.identifier( path.parentPath.node.property.name ),usage.node.right
                                                )
                                            ] )
                                    )
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
