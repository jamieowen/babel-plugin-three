var glob = require( 'glob' );

module.exports = ( threePath )=>{

    return glob.sync( 'examples/js/**/*.js', {
        cwd: threePath,
        ignore: [
            'examples/js/libs/**/*.*',
            'examples/js/crossfade/**/*.*',
            'examples/js/loaders/sea3d/**/*.*',
            'examples/js/loaders/ctm/**/*.*',

            // These ones are causing errors - somewhere...
            'examples/js/loaders/NodeMaterialLoader.js',
            'examples/js/loaders/PRWMLoader.js',
            'examples/js/loaders/XLoader.js',
            'examples/js/Octree.js',
            'examples/js/Volume.js'
            
        ]
    } )

}