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

app.get('/', (req, res) => {
    res.status(200).send('lol2k');
})

app.post('/', (req, res) => {
    const code = req.body.code;

    // should have a type
    // it's very big now, but that's just to illustrate how it can be done
    const testCases = [
        { 
            variables: {
                n: 12 
            },
            desiredOutput: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
        },
        { 
            variables: {
                n: 0 
            },
            desiredOutput: []
        },
        { 
            variables: {
                n: 2 
            },
            desiredOutput: [0, 1]
        },
        { 
            variables: {
                n: 1 
            },
            desiredOutput: [0]
        },
        { 
            variables: {
                n: 8 
            },
            desiredOutput: [0, 1, 1, 2, 3, 5, 8, 13]
        },
    ];

    // results and reports are mostly for testing and logging purposes
    // the user should only see their score
    const results = [];
    const reports = [];
    let successfulTests = 0;

    testCases.forEach((testCase, i) => {
        const context = vm.createContext(testCase.variables);
        const result = vm.runInContext(code, context);
        const report = result.every((item, j) => item === testCase.desiredOutput[j]);

        if (report) {
            successfulTests += 1;
        }

        results.push(result);
        reports.push({
            [i]: report
        })
    })
    
    console.log('results:', results);
    console.log('reports:', reports);
    
    res.status(201).send({
        result: results,
        msg: (successfulTests / reports.length) * 100
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

