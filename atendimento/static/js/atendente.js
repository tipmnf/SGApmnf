// conta as filas para mostrar ao atendente
<<<<<<< HEAD
function contaFila(dados, atendente) {
    var pessoasFila = document.getElementById("quantFila");
    var pessoasPref = document.getElementById("quantPref");
    var pessoasRegis = document.getElementById("quantReg");

    var numPessoas = 0;
    var numPessoasPref = 0;
    var numPessoasRegis = 0;
    
    console.log(atendente);

    if(atendente){
        for (var i = 0; i < dados.length; i++) {
            var dado = dados[i];
                if (dado.status == 'registrar'){
                    numPessoasRegis++;
                }
            }
    }else{
        for (var i = 0; i < dados.length; i++) {
            var dado = dados[i];
            if (dado.status == 'fila') {
                switch (dado.tipo) {
                    case 'Geral':
                        numPessoas++;
                        break;
                    case 'Alvará':
                        numPessoasPref++;
                        break;
                    default:
                        break;
                }
            }
        }
    }        
=======
function contaFila(dados) {
    var pessoasProc = document.getElementById("quantProc");
    var pessoasFila = document.getElementById("quantFila");
    var pessoasPref = document.getElementById("quantPref");
    
    var numPessoas = 0;
    var numPessoasPref = 0;
    var numPessoasProc = 0;

    for (var i = 0; i < dados.length; i++) {
        var dado = dados[i];
        if (dado.status == 'fila') {
            switch (dado.tipo) {
                case 'Geral':
                    numPessoas++;
                    break;
                case 'Preferencial':
                    numPessoasPref++;
                    break;
                case 'Processos':
                    numPessoasProc++;
                    break;
                default:
                    break;
            }
        }
    }

>>>>>>> 55daac35dfb6141c5c1a02057b52e41eb9b0a750
    try {
        pessoasFila.innerHTML = numPessoas;
        pessoasPref.innerHTML = numPessoasPref;
    } catch (error) {}
    try {
<<<<<<< HEAD
        pessoasRegis.innerHTML = numPessoasRegis;
    } catch (error) {}

    buttonLight(numPessoas, numPessoasPref, numPessoasRegis, atendente);
=======
        pessoasProc.innerHTML = numPessoasProc;
    } catch (error) {}
    

    fetch('/get-user/')
    .then(function(response){
        return response.json();
    })
    .then(function(dado){
        atendente = dado;
        buttonLight(numPessoas, numPessoasPref, numPessoasProc, atendente);
    });
>>>>>>> 55daac35dfb6141c5c1a02057b52e41eb9b0a750
}

function buttonGreen(btnCall){
    btnCall.style.backgroundColor = '#20b92c';
    btnCall.addEventListener('mouseover', function () {
        btnCall.style.backgroundColor = '#04fc18'
    })
    btnCall.addEventListener('mouseout', function () {
        btnCall.style.backgroundColor = '#20b92c';
    })
}

function buttonGray(btnCall){
    btnCall.addEventListener('mouseover', function () {
        btnCall.style.backgroundColor = "#4e4e4e"
    })
    btnCall.addEventListener('mouseout', function () {
        btnCall.style.backgroundColor = "gray"
    })
}

<<<<<<< HEAD
function buttonLight(numPessoas, numPessoasPref, numPessoasRegis, atendente) {
    let btnCall = document.querySelector('#btnCall');
    if (atendente == true) {
        if (numPessoasRegis != 0) {
            buttonGreen(btnCall);
        }
        else {
            buttonGray(btnCall);
=======
function buttonLight(numPessoas, numPessoasPref, numPessoasProc, atendente) {
    let btnCall = document.querySelector('#btnCall');
    if (atendente == "Processos") {
        if (numPessoasProc != 0) {
           buttonGreen(btnCall);
        }
        else {
           buttonGray(btnCall);
>>>>>>> 55daac35dfb6141c5c1a02057b52e41eb9b0a750
        }
    } else {
        if (numPessoas != 0 || numPessoasPref != 0) {
            buttonGreen(btnCall);
        }
        else {
<<<<<<< HEAD
            buttonGray(btnCall);
=======
           buttonGray(btnCall);
>>>>>>> 55daac35dfb6141c5c1a02057b52e41eb9b0a750
        }
    }
}

function getFilas() {
    fetch("/tabela-dados-fila/")
        .then(function (response) {
            return response.json();
        })
        .then(function (dados) {
            let arrayDados = dados;
            fetch("/get-user/")
                .then(function (response) {
                    return response.json();
                })
                .then(function (dados) {
                    contaFila(arrayDados, dados);
                });
            });
}

<<<<<<< HEAD
=======

// busca()
>>>>>>> 55daac35dfb6141c5c1a02057b52e41eb9b0a750
setInterval(function () {
    getFilas()
}, 5000);