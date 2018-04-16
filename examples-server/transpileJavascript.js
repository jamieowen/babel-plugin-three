const babel = require( 'babel-core' );
const cheerio = require( 'cheerio' );
const interceptor = require( 'express-interceptor' );
const threeClassIndex = require( '../src/three-class-index' );
const path = require( 'path' );
const webpackBundle = require( './webpackBundle' );



/**
 * Check if the .js file is used ( and compiled into ) the examples class index.
 * @param {*} scriptUrl 
 */
const isHandledSourceFile = function( scriptUrl ){
    
    return threeClassIndex.examplesPaths[ scriptUrl ] !== undefined;

}

const registeredUrls = {};
/**
 * 
 * Called from transformHtml.js.
 * 
 * When a http request is made to an example.html file.
 * The html is parsed for script tags and passed here.
 * 
 * This enables the Router to handle the next expected incoming .js file
 * request from the modified example html.
 * 
 * @param {*} htmlUrl 
 * @param {*} exampleSrcPaths 
 * @param {*} url 
 */
const createTranspiledExampleUrl = function( exampleUrl, url, exampleSrcPaths ){
    
    registeredUrls[ url ] = { url, exampleSrcPaths, exampleUrl }

}


/**
 * Middleware for handling registered urls.
 */
const transpileJavascript = interceptor( function( req,res ){
    
    return {

        isInterceptable: function(){
            return registeredUrls[ req.url ] !== undefined;
        },

        intercept: function( body,send ){

            console.log( 'Send Compiled JS' );
            const registered = registeredUrls[ req.url ];

            if( registered ){
            
                webpackBundle( registered.url, registered.exampleSrcPaths )
                    .then( ( source )=>{

                        // Have to set status code, 
                        // I think the static file middleware was sending a 404 due to the file being dynamic and no router handling it.                        
                        res.status( 200 ); 
                        res.set({ 'Content-Type': 'application/javascript' });     
                        send( source );
                        console.log( 'Compile Success..' );

                    })
                    .catch( ( error )=>{

                        if( error.errors ){
                            console.log( error.errors );
                        }
                        res.status( 404 );
                        send();

                    })

            }else{

                res.status( 404 );
                send();

            }

        }

    }

})

module.exports = transpileJavascript;
module.exports.createTranspiledExampleUrl = createTranspiledExampleUrl;
module.exports.isHandledSourceFile = isHandledSourceFile;