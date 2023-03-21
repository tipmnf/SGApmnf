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
    pessoasFila.innerHTML = '0';
    var pessoasPref = document.getElementById("quantPref");
    pessoasPref.innerHTML = '0';
    var pessoasProc = document.getElementById("quantProc");
    pessoasProc.innerHTML = '0';

    console.log("estou contando");

    var numPessoas = 0;
    var numPessoasPref = 0;
    var numPessoasProc = 0

    dados.forEach(function (dado) {
        if (dado.status == 'fila') {
            if (dado.tipo == 'Geral') {
                numPessoas = numPessoas + 1;
            }
            if (dado.tipo == 'Preferencial') {
                numPessoasPref = numPessoasPref + 1;
            }
            if (dado.tipo == 'Processos') {
                numPessoasProc = numPessoasProc + 1;
            }
        }

    });

    console.log("contei:", numPessoas, numPessoasPref, numPessoasProc);

    pessoasFila.innerHTML = numPessoas;
    pessoasPref.innerHTML = numPessoasPref;
    pessoasProc.innerHTML = numPessoasProc;

    let btnCall = document.querySelector('#btnCall');
    console.log(typeof (btnCall));
    if (numPessoas != 0 || numPessoasPref != 0 || numPessoasProc != 0) {
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