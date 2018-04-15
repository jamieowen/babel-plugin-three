const babel = require( 'babel-core' );
const cheerio = require( 'cheerio' );
const interceptor = require( 'express-interceptor' );
const threeClassIndex = require( '../src/three-class-index' );

const exampleRequests = {};

const registerExampleRequest = function( htmlUrl, scriptSrcs, compiledJsUrl ){
    
    console.log( htmlUrl, compiledJsUrl );
    exampleRequests[ compiledJsUrl ] = {
        // examplePath: examplePath,
        source: null
    }

}

const isHandledSourceFile = function( scriptUrl ){

    return threeClassIndex.examplesPaths[ scriptUrl ] !== undefined;

}


const transpileJavascript = interceptor( function( req,res ){
    
    return {

        isInterceptable: function(){
            return exampleRequests[ req.url ] !== undefined;
        },

        intercept: function( body,send ){

            console.log( 'Send Compiled JS' );
            const source = `
            window.alert( 'hello there :${req.url}' );
            `
            res.set({
                'Content-Type': 'application/javascript'
            })
                
            res.send( source );
            // send( source );
            

        }
    }

})

module.exports = transpileJavascript;
module.exports.registerExampleRequest = registerExampleRequest;
module.exports.isHandledSourceFile = isHandledSourceFile;