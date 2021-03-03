function callback(result) {
    console.log(result);
    document.getElementById("result").innerHTML = result;
}

document.getElementById("submit-button").addEventListener("click", () => {
    const code = document.getElementById("code-input").value;

    let xhr = new XMLHttpRequest();
    console.log('sender kode ' + code)
    
    xhr.onreadystatechange = function() {
        console.log('lol2k');
        console.log(this.readyState)
        console.log(this.responseText)
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("result").innerHTML = this.responseText;
        }
      }
      
    xhr.open("POST", "http://localhost:3000", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`code=${code}`)

});

