function contaFila(dados) {    
    var pessoasFila = document.getElementById("quantFila");
    pessoasFila.innerHTML = '';
    var pessoasPref = document.getElementById("quantPref");
    pessoasPref.innerHTML = '';
    var pessoasProc = document.getElementById("quantProc");
    pessoasProc.innerHTML = '';

    var numPessoas = 0;
    var numPessoasPref = 0;
    var numPessoasProc = 0

    dados.forEach(function(dado) {
        if(dado.status == 'fila'){
            if(dado.tipo == 'Geral'){
                numPessoas = numPessoas + 1;
            }
            if(dado.tipo == 'Preferencial'){
                numPessoasPref = numPessoasPref + 1;
            }
            if(dado.tipo == 'Processos'){
                numPessoasProc = numPessoasProc + 1;
            }
        }
    });    
    
    pessoasFila.innerHTML = numPessoas;
    pessoasPref.innerHTML = numPessoasPref;
    pessoasProc.innerHTML = numPessoasProc;

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

let radio = document.querySelectorAll('[type="radio"]');
let submitInput = document.getElementById('submitButton')

function animateShowInScreen(){
    submitInput.animate({
        opacity: [0, 1],
        transform: ["scale(0)", "scale(1)"]
    }, {
        duration: 300,
      });
}

function animateShakeInScreen(){
    submitInput.animate({
        transform: ['rotate(-3deg)', 'rotate(3deg)', 'rotate(-3deg)', 'rotate(3deg)', 'rotate(-3deg)', 'rotate(3deg)', 'rotate(-3deg)']
      }, {
        duration: 800,
      });
}

for(let i = 0; i < radio.length; i++){
    radio[i].addEventListener('change', function(){
        setTimeout(function(){
            animateShakeInScreen()
        }, 200)
        setTimeout(function(){
            submitInput.style.backgroundColor = 'green'
            animateShowInScreen()
        }, 200)  
    })
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