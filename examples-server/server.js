
const express = require( 'express' );
const cheerio = require( 'cheerio' );
const babel = require( 'babel-core' );
const interceptor = require( 'express-interceptor' );

const path = require( 'path' );
const transformHtml = require( './transformHtml' );
const transpileJavascript = require( './transpileJavascript' );

const app = express();
const httpRoot = path.join( __dirname, '..', 'three.js' );

app.use( transformHtml );
app.use( express.static( httpRoot ) );
app.use( transpileJavascript );

app.listen( 3000, ()=>{

    console.log( 'Example app listening on port 3000!' );

});