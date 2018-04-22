
var fs = require( 'fs' );
var pathUtil = require( 'path' );
var threeClassIndex;

try{
    threeClassIndex = require( './three-class-index' );
}catch(error){

}

module.exports = function babelPluginThree( babel ){

    const t = babel.types;

    console.log( 'Babel Plugin Three' );
    // TODO: Passing in flag via env vars - couldn't see a decent way to pass in global flags to babel??
    // This is just to run the plugin to generate a class index of known example vs three.js build classes.
    const BUILD_INDEX = process.env.BABEL_THREE_INDEX ? true : false;
    const BUILD_INDEX_PATH = process.env.BABEL_THREE_INDEX_PATH;
    const BUILD_INDEX_THREE_PATH = process.env.BABEL_THREE_PATH;

    // console.log( 'BUILD INDEX ', BUILD_INDEX );
    // console.log( 'PATH : ', BUILD_INDEX_PATH );
    // console.log( 'THREE PATH: ', BUILD_INDEX_THREE_PATH );

    /**
     * If this filename path is a three.js examples path and should be transformed.
     * 
     * @param {*} path 
     */
    const isThreeExampleFilePath = ( filename )=>{
        
        // A bit of a hack here. Need to updated to check module is within three.js module.
        // Or we could do a look up in the threeClassIndex.
        return filename.indexOf( '/test/fixtures/' ) >= 0 ||
            filename.indexOf( '/examples/js/' ) >= 0

    }

    return {

        pre:( state )=>{

            if( BUILD_INDEX && !this.indexMeta ){
                this.indexMeta = {};
            }                 

        },
        post: ( state )=>{

            if( BUILD_INDEX && this.indexMeta ){

                var relativePath = state.opts.filename.replace( BUILD_INDEX_THREE_PATH, '' );

                if( relativePath[0] === pathUtil.sep ){
                    relativePath = relativePath.slice(1);
                }

                /**
                 * Store lookup for examples.
                 * examplesPaths[ 'path/to/Example.js' ] = { imports: [], exports: [] }
                 */

                var index = JSON.parse( fs.readFileSync( BUILD_INDEX_PATH ) );
                index.examplesPaths[ relativePath ] = this.indexMeta;
                fs.writeFileSync( BUILD_INDEX_PATH, JSON.stringify( index, null, 4 ) );

            }

        },
        visitor: {

            Program: {

                enter: ( path, state )=>{
                    
                    if( !isThreeExampleFilePath( state.file.opts.filename ) ){
                        path.stop();
                    }else{
                        console.log( 'babel-three-plugin: Should process..' );
                        console.log( state.file.opts.filename );
                        console.log( '' );
                    }

                    state.pluginThree = {
                        imports: [],
                        exports: []
                    }

                },
                exit: ( path, state )=>{

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

                    /**
                     * Using the three class index, resolve imports differently 
                     * depending on their inclusion in either the three.js default build
                     * or those existing in the examples folder.
                     */
                    let imports = [];
                    let threeImportNodes = [];
                    let exampleImportNodes = [];

                    state.pluginThree.imports.forEach( (im)=>{
                        
                        if( imports.indexOf(im) === -1 && exports.indexOf(im) === -1 && im !== exportDefault ){

                            imports.push( im );

                            if( !BUILD_INDEX && threeClassIndex ){

                                if( threeClassIndex.three[ im ] ){
                                    threeImportNodes.push( 
                                        t.importSpecifier( t.identifier( im ), t.identifier( im ) )
                                    );
                                }else
                                if( threeClassIndex.examplesClasses[ im ] ){
                                    exampleImportNodes.push( 
                                        t.importDeclaration( 
                                            [ t.importSpecifier( t.identifier( im ), t.identifier( im ) ) ], 
                                            t.stringLiteral( `three/${threeClassIndex.examplesClasses[im]}` ) 
                                        )
                                    )
                                }else{
                                    console.log( 'Error', im );
                                    throw new Error( `Problem resolving dependency ${im}` );
                                }

                            }else{                                
                                threeImportNodes.push( 
                                    t.importSpecifier( t.identifier( im ), t.identifier( im ) )
                                );
                            }
                            
                            
                        }

                    } );

                    // var importNodes = imports.map( ( im )=>{
                    //     return t.importSpecifier( t.identifier( im ), t.identifier( im ) );
                    // });

                    if( threeImportNodes.length ){
                        path.unshiftContainer( 'body',
                            t.importDeclaration( threeImportNodes, t.stringLiteral( 'three' ) )
                        )   
                    }

                    if( exampleImportNodes.length ){
                        exampleImportNodes.forEach( (node)=>{
                            path.unshiftContainer( 'body', node );                     
                        })
                    }
           
                    let exportNodes = exports.map( ( ex )=>{
                        return t.exportSpecifier( t.identifier( ex ), t.identifier( ex ) );                        
                    } );

                    path.pushContainer( 'body',
                        t.exportNamedDeclaration( null, exportNodes )
                    )                                  
                    
                    if( exportDefault ){
                        path.pushContainer( 'body', 
                            t.exportDefaultDeclaration( t.identifier( exportDefault ) )
                        )
                    }

                    if( BUILD_INDEX ){
                        this.indexMeta = {
                            imports: imports,
                            exports: exports,
                            exportDefault: exportDefault
                        }
                    }

                }

            },

            ExpressionStatement: {

                enter( path, state ){

                    /**
                     * 
                     * There are some cases where an example is wrapped entirely in a self-executing function closure. 
                     * e.g. TransformControls.
                     * In this case, we can replace the ExpressionStatement with the array of nodes of the BlockStatement body.
                     * 
                     * ( function(){
                     * 
                     *      THREE.TransformControls = function(){
                     *      
                     *      }
                     * 
                     *      THREE.TransformControls.prototype = Object.create(Object3D.prototype);
                     *      .. etc
                     * 
                     * }() )
                     * 
                     * The rest of the AST will be traversed as normal using the usual node modification logic.
                     * 
                     */
                    if( t.isProgram( path.getFunctionParent() ) ){

                        if( 
                            t.isCallExpression( path.node.expression ) &&
                            t.isFunctionExpression( path.node.expression.callee )
                        ){
                            let block = path.node.expression.callee.body;
                            path.replaceWithMultiple( block.body );                            
                        }

                    }

                }

            },

            Identifier: {

                enter: ( path, state )=>{

                    if( path.node.name === 'THREE' ){
                        
                        if( t.isMemberExpression( path.parentPath ) ){

                            const usage = path.parentPath.parentPath;
                            const memberName = path.parentPath.node.property.name;

                            // console.log( 'Member Name :', memberName );
                            // console.log( 'Usage Node :', usage.type, Object.keys( usage.node ) );
                            // console.log( 'Right Node :', usage.node.right );
                            // console.log( 'Parent Info', usage.parentPath.type, usage.parentPath.parentPath.type );

                            /**
                             * 
                             * The first declaration case is the standard ES5 class function, 
                             * e.g. THREE.OrbitControls = function(){...}
                             * AST : t.isFunctionExpression()
                             * 
                             * and the second is the object expression style used for shader uniforms and shader code.
                             * e.g. THREE.CopyShader = { uniforms: {}, vertexShader: '', etc:'' }
                             * AST : t.isObjectExpression()
                             * 
                             */
                            if( t.isProgram( usage.getFunctionParent() ) 
                                && ( t.isFunctionExpression( usage.node.right ) || t.isObjectExpression( usage.node.right ) )
                                && t.isAssignmentExpression( usage ) 
                                && t.isExpressionStatement( usage.parentPath ) 
                            ){

                                state.pluginThree.exports.push( memberName );
                                
                                // https://github.com/babel/babel/issues/5072
                                usage.parentPath.replaceWith( 
                                    t.variableDeclaration( "var", [
                                        t.variableDeclarator( 
                                            t.identifier( memberName ),usage.node.right
                                        )
                                    ])
                                );

                            }else{

                                /**
                                 * Treat everything after as an import dependancy.
                                 * Some export & import memberNames will be repeated, but
                                 * these will be filtered out on ProgramNode.exit()
                                 */

                                state.pluginThree.imports.push( memberName );
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
