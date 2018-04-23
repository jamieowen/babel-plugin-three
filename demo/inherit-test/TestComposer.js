import { TestPass } from './TestPass';

/**
 * Mimic situtation with imports in transformed EffectComposer.
 */

var Composer = function( p ){

    if( p instanceof TestPass ){
        console.log( 'Is TestPass' );
    }

}

var Pass = function(){

    this.id = 'Pass';

}

console.log( 'DEFINE ', Composer, Pass );

export { Pass,Composer };
export default Composer;