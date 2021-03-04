const {VM} = require('vm2');
const vm = require('vm');
const cors = require('cors');


const express = require("express");

const app = express();
const port = 3000;


app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());
app.use(cors());

app.post('/', (req, res) => {
    const code = req.body.code;
    const context = vm.createContext();
    const result = vm.runInContext(code, context);

    res.status(201).send({
        result: result,
        msg: result
    });
})

app.post('/script', (req, res) => {
    /*
    Uses vm2 instead of vm. Supposedly more secure: https://odino.org/eval-no-more-understanding-vm-vm2-nodejs/
    */
   const vm2 = new VM(); 
   const code = req.body.code;
   const result = vm2.run(code);

   res.status(200).send({
       result: result,
       msg: result
   });
})


app.listen(port, () => {
    console.log(`backend listening at http://localhost:${port}`)
})


