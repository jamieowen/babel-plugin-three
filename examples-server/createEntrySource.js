
const threeClassIndex = require('../src/three-class-index');
const threePath = 'three/';

/**
 * Compatitble with val-loader webpack loader
 * @param {C} exampleSrcPaths 
 */
const createEntrySource = function ( {exampleSrcPaths} ) {

    console.log( 'Create Source with paths :', exampleSrcPaths );
    const info = exampleSrcPaths.map((src) => {
        return threeClassIndex.examplesPaths[src];
    });

    const imports = info.map((entry, i) => {

        console.log( 'i',i, entry );
        return entry.exports.map((ex) => {
            return `import {${ex}} from "${threePath + exampleSrcPaths[i].replace('.js', '')}";`;
        }).join('\n');

    })

    const memberDeclarations = info.map((entry, i) => {

        return entry.exports.map((ex) => {
            return `THREE.${ex} = ${ex};`;
        }).join('\n');

    })

    const logImports = info.map((entry, i) => {

        return entry.exports.map((ex) => {
            return `console.log( ${ex} );`;
        }).join('\n');

    })

    console.log( imports, memberDeclarations );

    const _source = `    
        ${imports.join('\n')}

        console.log( 'Log imports' );
        ${logImports.join('\n')}
        console.log( 'HELLO THERE' );
        console.log( THREE );

        ${memberDeclarations.join('\n')}
    `

    

    const source = `
    import * as THREE from 'three';

    console.log( THREE );
    window.alert( 'Hello World' ); 
    /** ${ exampleSrcPaths.join('\n') }**/
    `

    console.log( 'Source :', source );
    
    return {
        code: source,
        cachable: false
    }
}

module.exports = createEntrySource;