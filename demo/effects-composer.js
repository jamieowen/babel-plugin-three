import { 
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    BoxBufferGeometry,
    Object3D,
    Mesh,
    MeshLambertMaterial,
    HemisphereLight
} from 'three';

import { EffectsComposer } from 'three/examples/js/postprocessing/EffectComposer';

window.onload = ()=>{

    const renderer = new WebGLRenderer({
        antialias: true
    });

    const scene = new Scene();
    const camera = new PerspectiveCamera( 45,4/3,0.1,500 );
    const light = new HemisphereLight( 0xffffff, 0x330011 );

    const style =  document.createElement( 'style' )
    style.innerHTML = `
        body{
            overflow: hidden;
            margin: 0px;
            padding: 0px;
        }
    `;

    document.body.appendChild( style );
    document.body.appendChild( renderer.domElement );

    const geometry = new BoxBufferGeometry(1,1,1,1,1,1);    
    const cube = new Mesh( geometry, new MeshLambertMaterial({
        color: 0xff00ff
    }));

    scene.add( cube );
    scene.add( light );
    scene.add( camera );

    camera.position.z = 4;

    const onRender = ()=>{

        cube.rotation.x += Math.PI * 0.005;
        cube.rotation.y += Math.PI * 0.005;

        renderer.render( scene, camera );
        requestAnimationFrame( onRender );

    }

    const onResize = ()=>{

        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    onResize();
    onRender();

}