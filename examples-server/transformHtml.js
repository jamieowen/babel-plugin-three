const babel = require( 'babel-core' );
const cheerio = require( 'cheerio' );
const interceptor = require( 'express-interceptor' );

const transpiler = require( './transpileJavascript' );

const transformHtml = interceptor( function( req,res ){
    
    return {

        isInterceptable: function(){
            return req.url.slice( -5 ) === '.html';
        },

        intercept: function( body,send ){

            const document = cheerio.load(body);
            const scripts = document('body').find( 'script' );
            const toCompile = [];
            const compiledJsUrl = req.url.replace( '.html', '_transpiled.js' );

            // Check if each script src is handled by the plugin.
            for( let i = 0; i<scripts.length; i++ ){

                let script = scripts[i];
                let src = 'examples/' + script.attribs.src;
                if( transpiler.isHandledSourceFile( src ) ){
                    document(`script[src="${script.attribs.src}"]`).remove();
                    toCompile.push( src );
                    console.log( 'Removed ', src );
                }else{
                    console.log( 'Kept :', src );
                }

            }

            // Register each script src with the transpiler and add a new script tag to the tranpiled source.            
            // The source will be compiled & cached when the request is made.

            transpiler.registerExampleRequest( req.url, toCompile, compiledJsUrl );
            document( 'body' ).append( `
                <script src="${compiledJsUrl}"></script>
            `)
            // Style.
            document( 'head' ).append( `
                <style> 
                    div.babel-info-panel{
                        position: absolute;
                        margin: 0px;
                        padding: 10px;
                        padding-bottom: 20px;
                        bottom: 0px; left: 0px;
                        z-index: 999999;
                        font-size: 12px;
                        line-height: 12px;
                        color: black;
                        width: auto;
                        height: auto;
                        background-color: hotpink;
                        text-align: left;
                    }               
                </style>
            `);

            const compiledTags = toCompile.map( (src)=>{
                return `<p>${src}</p>`;
            })

            // Info
            document( 'body' ).append( `
                <div class="babel-info-panel">
                    <p>babel-plugin-three</p>
                    <p>Transpiled:</p>
                    <p><a target="_blank" href="${compiledJsUrl}">${ compiledJsUrl }</a></p>
                    ${ compiledTags.join('') }
                </div>
            ` );

            send( document.html() );

        }
    }

})

module.exports = transformHtml;