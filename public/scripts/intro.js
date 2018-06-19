this.playSequence([
    {
        time: 0,
        callback: function () {
         this.addEntity('rebecca', 'CharacterEntity', 10, 10);
        }
    },
    {
        time: 100,
        callback: function() {
            var r  = this.getEntity('rebecca');
            r.turnRight();
            r.walkLeft();
        }
    },
    {
        time: 200,
        callback: function () {
            var r  = this.getEntity('rebecca');
            r.stop();
        }
    }
]);