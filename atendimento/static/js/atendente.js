function montaTabela(dados) {
    var corpoTabela = document.getElementById("tbody");
    corpoTabela.innerHTML = '';
    dados.forEach(function (dado) {
        var linha = document.createElement("tr");

        var senha = document.createElement("td");
        senha.innerHTML = dado.senha;
        linha.appendChild(senha);

        var tipo = document.createElement("td");
        tipo.innerHTML = dado.tipo;
        linha.appendChild(tipo);

        // var cliente = document.createElement("td");
        // cliente.innerHTML = dado.cliente;
        // linha.appendChild(cliente);

        // var status = document.createElement("td");
        // status.innerHTML = dado.status;
        // linha.appendChild(status);

        corpoTabela.appendChild(linha);
    });
}
// function busca(){
//   fetch("/tabela-dados-fila/")
//         .then(function(response) {
//             return response.json();
//         })
//         .then(function(dados) {
//             montaTabela(dados);
//         });
//     }

// conta as filas para mostrar ao atendente
function contaFila(dados) {
    var pessoasFila = document.getElementById("quantFila");
    var pessoasPref = document.getElementById("quantPref");
    var pessoasRegis = document.getElementById("quantReg");
    var atendente;

    fetch('/get-user/')
        .then(function (response) {
            return response.json();
        })
        .then(function (dado) {
            atendente = dado;
        });

    var numPessoas = 0;
    var numPessoasPref = 0;
    var numPessoasRegis = 0

    for (var i = 0; i < dados.length; i++) {
        var dado = dados[i];

        if(atendente.registrador){
            if (dado.status == 'registrar'){
                numPessoasRegis++;
            }
        }else{
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

    console.log("contei:", numPessoas, numPessoasPref, numPessoasProc);

    pessoasFila.innerHTML = numPessoas;
    pessoasPref.innerHTML = numPessoasPref;
    pessoasRegis.innerHTML = numPessoasRegis;

    let btnCall = document.querySelector('#btnCall');
    console.log(typeof (btnCall));
    if (numPessoas != 0 || numPessoasPref != 0) {
        addEventListener('hover', function(){
            btnCall.style.backgroundColor = '#04fc18'
        })
        btnCall.style.backgroundColor = '#20b92c';
        console.log('ta')
    }
    else {
        btnCall.style.backgroundColor = 'gray';
        console.log('ok')
    }
}

function getFilas() {
    fetch("/tabela-dados-fila/")
        .then(function (response) {
            return response.json();
        })
        .then(function (dados) {
            contaFila(dados);
        });
}

// busca()
setInterval(function () {
    getFilas()
}, 5000);