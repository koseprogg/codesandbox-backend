const Sandbox = require("sandbox");
const express = require("express");

const app = express();
const port = 3000;

let s = new Sandbox(); 

let code = "";

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

app.post('/', (req, res) => {
    console.log(req.body.code);

    code = req.body.code;

    let result = runCode();

    res.body = result;
    res.status = 200;
})

app.listen(port, () => {
    console.log(`backend listening at http://localhost:${port}`)
})


function runCode() {
    let result = "";

    s.run(code, function(output) {
        console.log(output.result);
        result = output.result;
    })

    return result;
}


