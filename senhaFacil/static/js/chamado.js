function speak(text, cabine) {
    var speech = new SpeechSynthesisUtterance();
    speech.text = text+", por favor se dirija à cabine"+cabine;
    speech.lang = 'pt-BR';
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}
function montaTabela(dados) {    
var corpoTabela = document.getElementById("tbody");
corpoTabela.innerHTML = '';
dados.forEach(function(dado) {
    var linha = document.createElement("tr");

    var senha = document.createElement("td");
    senha.innerHTML = dado.senha;
    linha.appendChild(senha);
    
    // var cliente = document.createElement("td");
    // cliente.innerHTML = dado.cliente;
    // linha.appendChild(cliente);

    var cabine = document.createElement("td");
    cabine.innerHTML = dado.cabine;
    linha.appendChild(cabine);
  
    // var status = document.createElement("td");
    // status.innerHTML = dado.status;
    // linha.appendChild(status);

    corpoTabela.appendChild(linha);  
    speak(dado.cliente, dado.cabine)      
});    
}

function montaTabelaAnteriores(dados) {    
    var corpoTabela = document.getElementById("tbodyanteriores");
    corpoTabela.innerHTML = '';
    dados.forEach(function(dado) {
        var linha = document.createElement("tr");
    
        var senha = document.createElement("td");
        senha.innerHTML = dado.senha;
        linha.appendChild(senha);
        
        // var cliente = document.createElement("td");
        // cliente.innerHTML = dado.cliente;
        // linha.appendChild(cliente);
    
        var cabine = document.createElement("td");
        cabine.innerHTML = dado.cabine;
        linha.appendChild(cabine);
      
        // var status = document.createElement("td");
        // status.innerHTML = dado.status;
        // linha.appendChild(status);
    
        corpoTabela.appendChild(linha);      
    });    
    }

function getFilas(){
        fetch("/tabela-dados/")
            .then(function(response) {
                return response.json();
            })
            .then(function(dados) {
                montaTabela(dados);
            });
        
        // fetch("/tabela-dados-anteriores/")
        //     .then(function(response) {
        //         return response.json();
        //     })
        //     .then(function(dados) {
        //         montaTabelaAnteriores(dados);
        //     });
        
    }


function cresceSenha(){
    var senha = document.getElementById("minha-div");
    aumentaSenha = [
        {width:'30%'},
        {width:'100%', offset: 0.3},
        {width:'100%', offset: 0.7},
        {width:'30%', offset: 1},
    ];
    
    senha.animate(aumentaSenha, {duration: 8000});
}

// function encolheSenha(){
//     var senha = document.getElementById("minha-div");
//     var video = document.getElementById("videoDisplay");
//     senha.style.width = '30%';
//     senha.style.height = '55%';
//     video.style.width = '70%';
//     video.style.height = '45%';
// }

var taChamando = 0;
var auxChamando = 0;

function getChamando(){
    fetch("/ta-chamando/")
    .then(function(response) {
        return response.json();
    })
    .then(function(taChamando) {
        
        if(taChamando > auxChamando){
            cresceSenha();
            auxChamando = taChamando;
        }else{
            auxChamando = taChamando;
        }      
    });
}

setInterval(function() {
    getChamando();
    getFilas();
}, 1000);
