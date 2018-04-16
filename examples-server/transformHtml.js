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
            const toTranspile = [];
            const transpiledJsUrl = req.url.replace( '.html', '_transpiled.js' );
            const lastScript = null;

            console.log( '>>' );
            console.log( req.url );
            console.log( 'Scripts length : ', scripts.length );

            // Check if each script src is handled by the plugin.
            for( let i = 0; i<scripts.length; i++ ){

                let script = scripts[i];
                let src = 'examples/' + script.attribs.src;
                console.log( 'Test SRC :', src, script.attribs );

                if( transpiler.isHandledSourceFile( src ) ){
                    document(`script[src="${script.attribs.src}"]`).remove();
                    toTranspile.push( src );
                    console.log( 'Removed ', src );
                }else{
                    console.log( 'Kept :', src );
                }

            }

            // Register each script src with the transpiler and add a new script tag to the tranpiled source.            
            // The source will be compiled & cached when the request is made.

            const willTranspile = toTranspile.length > 0;
            if( willTranspile ){

                transpiler.createTranspiledExampleUrl( req.url, transpiledJsUrl, toTranspile );
                document( `<script src="${transpiledJsUrl}"></script>` ).insertAfter( 'script[src="../build/three.js"]' );

            }


            // Style.
            document( 'head' ).append( `
                <style> 

                    .babel-ele{
                        font-family: Monospace;
                        font-weight: normal;
                        font-size: 12px;
                        line-height: 30px;
                        color: black;
                        text-align: left;
                        margin: 0px; padding: 0px;
                    }


                    .babel-h{
                        color: white;
                    }

                    .babel-link{
                        color: pink;
                    }

                    div.babel-info-panel{
                        position: absolute;
                        margin: 0px;
                        padding: 10px;
                        padding-bottom: 20px;
                        bottom: 0px; left: 0px;
                        z-index: 999999;
                        width: auto;
                        height: auto;
                        background-color: hotpink;
                    }
                    
                    div.babel-class-container{
                        margin: 0px;
                        padding: 0px;
                        max-height: 200px;
                        overflow-y: scroll;
                    }
                </style>
            `);

            const exampleFiles = toTranspile.map( (src)=>{
                return `<p class="babel-ele">${src}</p>`;
            });

            const transpileInfo = willTranspile ? 
                `
                <p class="babel-ele babel-h"><em>Transpiled</em></p>                    
                <p class="babel-ele"><a class="babel-ele babel-link" target="_blank" href="${transpiledJsUrl}">${ transpiledJsUrl }</a></p>                
                <p class="babel-ele babel-h"><em>Files (${toTranspile.length})</em></p>
                ` :
                `
                <p class="babel-ele"><em>No need to transpile.</em></p>                    
                `

            // Info
            document( 'body' ).append( `
                <div class="babel-info-panel babel-ele">
                    <p class="babel-ele babel-h">babel-plugin-three</p>
                    ${transpileInfo}
                    <div class="babel-class-container">
                    ${ exampleFiles.join('') }
                    </div>
                </div>
            ` );

            send( document.html() );

        }
    }

})

module.exports = transformHtml;