function callback(result) {
    console.log(result);
    document.getElementById("result").innerHTML = result;
}

document.getElementById("submit-button").addEventListener("click", async () => {
    const code = document.getElementById("code-input").value;

    const data = {
        task: 1,
        code: code
    };

    console.log('trying to send code:', JSON.stringify(data));
    
    const result = await fetch('http://localhost:3000', {
        method: 'POST',
        origin: 'http://localhost',
        mode: 'no-cors',
        body: `task=${data.task}&code=${data.code}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then((res) => {
        res.text();
        console.log(res);
    })
    .then((data) => {
        console.log(data);
        return data;
    });

    document.getElementById("result").innerHTML = result;

});

