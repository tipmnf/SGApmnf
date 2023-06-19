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
async function contaFila(dados) {
    var pessoasProc = document.getElementById("quantProc");
    var pessoasFila = document.getElementById("quantFila");
    var pessoasPref = document.getElementById("quantPref");
    
    var numPessoas = dados[0];
    var numPessoasPref = dados[1];
    var numPessoasProc = dados[2];

    // for (var i = 0; i < dados.length; i++) {
    //     var dado = dados[i];
    //     if (dado.status == 'fila') {
    //         switch (dado.tipo) {
    //             case 'Geral':
    //                 numPessoas++;
    //                 break;
    //             case 'Preferencial':
    //                 numPessoasPref++;
    //                 break;
    //             case 'Processos':
    //                 numPessoasProc++;
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    // }

    try {
        pessoasFila.innerHTML = numPessoas;
        pessoasPref.innerHTML = numPessoasPref;
    } catch (error) {}
    try {
        pessoasProc.innerHTML = numPessoasProc;
    } catch (error) {}
    

    await fetch('/get-user/')
    .then(function(response){
        return response.json();
    })
    .then(function(dado){
        atendente = dado;
        buttonLight(numPessoas, numPessoasPref, numPessoasProc, atendente);
    });
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

async function getFilas() {
        await fetch("/conta-fila/")
            .then(function (response) {
                return response.json();
            })
            .then(function (dados) {
                contaFila(dados);
            });
    }



// busca()
setInterval(async function () {
    getFilas();
}, 1000);