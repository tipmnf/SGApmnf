// conta as filas para mostrar ao atendente
function contaFila(dados, atendente) {
    var pessoasFila = document.getElementById("quantFila");
    var pessoasPref = document.getElementById("quantPref");
    var pessoasRegis = document.getElementById("quantReg");

    var numPessoas = 0;
    var numPessoasPref = 0;
    var numPessoasRegis = 0;
    
    if(atendente.registrador){
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
                    case 'Preferencial':
                        numPessoasPref++;
                        break;
                    default:
                        break;
                }
            }
        }
    }        
    try {
        pessoasFila.innerHTML = numPessoas;
        pessoasPref.innerHTML = numPessoasPref;
    } catch (error) {}
    try {
        pessoasRegis.innerHTML = numPessoasRegis;
    } catch (error) {}

    buttonLight(numPessoas, numPessoasPref, numPessoasRegis, atendente);
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

function buttonLight(numPessoas, numPessoasPref, numPessoasProc, atendente) {
    let btnCall = document.querySelector('#btnCall');
    if (atendente == "Processos") {
        if (numPessoasProc != 0) {
            buttonGreen(btnCall);
        }
        else {
            buttonGray(btnCall);
        }
    } else {
        if (numPessoas != 0 || numPessoasPref != 0) {
            buttonGreen(btnCall);
        }
        else {
            buttonGray(btnCall);
        }
    }
}

function getFilas() {
    fetch("/tabela-dados-fila/")
        .then(function (response) {
            return response.json();
        })
        .then(function (dados) {
            fetch("/get-user/")
                .then(function (response) {
                    return response.json();
                })
                .then(function (dados) {
                    contaFila(dados, atendente);
                });
            });
}

setInterval(function () {
    getFilas()
}, 5000);