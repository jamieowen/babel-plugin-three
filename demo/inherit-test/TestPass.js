import { Pass } from './TestComposer';

console.log( '(TestPass)', Pass );
var TestPass = function(){

    Pass.call( this );

}

TestPass.prototype = Object.assign( 

    Object.create( Pass.prototype ), {

        testPassFunction: function(){
            console.log( 'testPassFunction()' );
        }

    }

)

export { TestPass };
export default TestPass;