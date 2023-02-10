function contaFila(dados) {    
    var pessoasFila = document.getElementById("quantFila");
    pessoasFila.innerHTML = '';
    var numPessoas = 0
    dados.forEach(function(dado) {
        if(dado.status == 'fila'){
            numPessoas = numPessoas + 1;
        }
    });    
    
    pessoasFila.innerHTML = numPessoas;

}

function getFilas(){
    fetch("/tabela-dados-fila/")
        .then(function(response) {
            return response.json();
        })
        .then(function(dados) {
            contaFila(dados);
        });
}


function imprimeSenha(cliente){

    const ThermalPrinter = require("thermal-printer");

    const printer = new ThermalPrinter({
    type: "epson",
    interface: "usb",
    });

    printer
    .align("center")
    .bold(true)
    .println("Hello World!")
    .bold(false)
    .println("Welcome to the world of thermal printers.")
    .cut();

    printer.execute(function (err) {
    if (err) {
        console.error("Print failed", err);
    } else {
        console.log("Print done");
    }
    });


}

setInterval(function() {
    getFilas()
}, 5000);