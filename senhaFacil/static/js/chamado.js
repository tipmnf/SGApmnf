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
        
        fetch("/tabela-dados-anteriores/")
            .then(function(response) {
                return response.json();
            })
            .then(function(dados) {
                montaTabelaAnteriores(dados);
            });
        
    }


function cresceVideo(){
    var video = document.getElementById("videoDisplay");
    video.style.width = '100%';
    video.style.height = '100%';
}

function encolheVideo(){
    var video = document.getElementById("videoDisplay");
    video.style.width = '50%';
    video.style.float = 'right';
    video.style.marginTop = '45px';
}

var taChamando = false;
var auxChamando = false;

function getChamando(){
    fetch("/ta-chamando/")
    .then(function(response) {
        return response.json();
    })
    .then(function(taChamando) {
        
        if(taChamando !== auxChamando){
            if(taChamando){
                encolheVideo();
            }else{
                cresceVideo();
            }
            auxChamando = taChamando;
        }

    });
}

setInterval(function() {
    getChamando();
}, 1000);

setInterval(function() {
    getFilas();
    console.log("help");
}, 5000);
