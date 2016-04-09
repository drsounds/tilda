var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser());
app.use('/', express.static(__dirname + '/public'));


app.get('/api/levels/:level', function (req, res) {
    var level_name = req.params.level;
    var path = __dirname + '/public/levels/' + level_name + '.json';
    try{
     var t = fs.statSync(path).isFile();
    } catch (e) {
        fs.writeFileSync(path, JSON.stringify({player: {x: 0, y: 0}, blocks: []}));
    }
    var data  = fs.readFileSync(path);
    var level = JSON.parse(data);
    res.json(level);
});

app.put('/api/levels/:level', function (req, res) {
    var level_name = req.params.level;
     var body = JSON.stringify(req.body);
     fs.writeFileSync(__dirname + '/public/levels/' + level_name + '.json', body);
     res.json({
         status: 'OK'
     });
});
app.get('/*', function (req, res) {
    
    var index_html = fs.readFileSync(__dirname + '/public/index.html');
    res.write(index_html);
    res.end();
})

app.listen(process.env.PORT);