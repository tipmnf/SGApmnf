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

    var quantArray = document.querySelectorAll(".quant")
    console.log(quantArray)
    console.log(dados)

    for (let index = 0; index < quantArray.length; index++) {
        quantArray[index].innerText = dados[index]
    }

    await fetch('/get-user/')
    .then(function(response){
        return response.json();
    })
    .then(function(dado){
        atendente = dado;
        buttonLight(dados);
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

function buttonLight(dados) {
    let btnCall = document.querySelectorAll('.btnCall');

    for (let index = 0; index < btnCall.length; index++) {
        if(dados[index] != 0){
            buttonGreen(btnCall[index]);
        }else{
            buttonGray(btnCall[index]);
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