const babel = require( 'babel-core' );
const cheerio = require( 'cheerio' );
const interceptor = require( 'express-interceptor' );
const threeClassIndex = require( '../src/three-class-index' );
const path = require( 'path' );
const webpackBundle = require( './webpackBundle' );

const exampleRequests = {};

const registerExampleRequest = function( htmlUrl, scriptSrcs, transpiledJsUrl ){
    
    console.log( htmlUrl, transpiledJsUrl );
    exampleRequests[ transpiledJsUrl ] = {
        transpiledJsUrl: transpiledJsUrl,
        scriptSrcs: scriptSrcs,
        source: null
    }

}

const isHandledSourceFile = function( scriptUrl ){
    
    return threeClassIndex.examplesPaths[ scriptUrl ] !== undefined;

}

const threePath = '../three.js/'
const createEntrySource = function( scriptSrcs ){

    const info = scriptSrcs.map( (src)=>{
        return threeClassIndex.examplesPaths[src];
    });

    const imports = info.map( (entry,i)=>{

        return entry.exports.map((ex)=>{
            return `import {${ex}} from "${ threePath + scriptSrcs[i].replace('.js','')}";`;
        }).join('\n');

    })

    const memberDeclarations = info.map( (entry,i)=>{

        return entry.exports.map((ex)=>{
            return `THREE.${ex} = ${ex};`;
        }).join('\n');

    })

    const source = `
        ${imports.join('\n')}
        ${memberDeclarations.join('\n')}
    `

    return source;
}


const transpileJavascript = interceptor( function( req,res ){
    
    return {

        isInterceptable: function(){
            return exampleRequests[ req.url ] !== undefined;
        },

        intercept: function( body,send ){

            console.log( 'Send Compiled JS' );
            const cache = exampleRequests[ req.url ];

            if( !cache.source ){
                
                const bundled = webpackBundle( createEntrySource( cache.scriptSrcs ) );
                cache.source = bundled.source;

            }

            res.set({ 'Content-Type': 'application/javascript' });                
            res.status( 200 );

            send( cache.source );            

        }
    }

})

module.exports = transpileJavascript;
module.exports.registerExampleRequest = registerExampleRequest;
module.exports.isHandledSourceFile = isHandledSourceFile;