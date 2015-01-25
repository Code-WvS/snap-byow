var createGame = require('voxel-engine');
var highlight = require('voxel-highlight');
var player = require('voxel-player');
var voxel = require('voxel');
var fly = require('voxel-fly');
var walk = require('voxel-walk');

function generator(x, y, z) {
    return y === 1 ? 1 : 0;
}

module.exports = function(setup) {
    setup = setup || defaultSetup;
    var options = {
        generate: generator,//voxel.generator['Valley'],
        chunkDistance: 2
    };
    // setup the game and add some trees
    var game = createGame(options);
    window.game = game;
    gameWorld = document.createElement('div');
    game.appendTo(gameWorld);
    window.gameWorld = gameWorld;
    if (game.notCapable()) return game;
    var createPlayer = player(game);

    var activeplayer = createPlayer('player.png');
    window.gamePlayer = activeplayer;
    activeplayer.possess();
    activeplayer.yaw.position.set(2, 14, 4);

    setup(game, activeplayer);

    return game;
};

function defaultSetup(game, avatar) {
    var makeFly = fly(game);
    var target = game.controls.target();
    game.flyer = makeFly(target);

    // highlight blocks when you look at them, hold <Ctrl> for block placement
    var blockPosPlace, blockPosErase;
    var hl = game.highlighter = highlight(game, { color: 0xff0000 });
    hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos; });
    hl.on('remove', function (voxelPos) { blockPosErase = null; });
    hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos; });
    hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null; });

    // block interaction stuff, uses highlight data
    var currentMaterial = 1;

    game.on('fire', function (target, state) {
        var position = blockPosPlace;
        if (position) {
            game.createBlock(position, currentMaterial);
        }
        else {
            position = blockPosErase;
            if (position) game.setBlock(position, 0);
        }
    });
    
    game.on('tick', function() {
        walk.render(target.playerSkin);
        var vx = Math.abs(target.velocity.x);
        var vz = Math.abs(target.velocity.z);
        if (vx > 0.001 || vz > 0.001) walk.stopWalking();
        else walk.startWalking();
    });
}
