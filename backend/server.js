const Sandbox = require("sandbox");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;
const corsOptions = {
    origin: '*'
};

let s = new Sandbox(); 

let code = "";

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());

app.get('/', (req, res) => {
    res.status = 200;
    res.send('Lol2k');
})

app.post('/', cors(corsOptions), (req, res) => {
    console.log('received code:', req.body.code);

    const body = req.body;

    console.log('body:', body)

    code = body.code;

    s.run(code, function(output) {
        console.log(output);

        res.status(200).send(output.result);
    })
})

app.listen(port, () => {
    console.log(`backend listening at http://localhost:${port}`)
})

