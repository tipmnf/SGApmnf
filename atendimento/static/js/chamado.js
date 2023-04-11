function speak(text, cabine) {
    var speech = new SpeechSynthesisUtterance();
    speech.text = "senha"+text+", por favor se dirija à cabine"+cabine;
    speech.lang = 'pt-BR';
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    console.log(window.speechSynthesis.pending);
    if(window.speechSynthesis.pending == false){
        window.speechSynthesis.speak(speech);
    }
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
        // speak(dado.senha, dado.cabine);       
});    
}

async function getFilas(){
        await fetch("/tabela-dados/")
            .then(function(response) {
                return response.json();
            })
            .then(function(dados) {
                montaTabela(dados);
            });
        
    }


function cresceSenha(){
    var senha = document.getElementById("minha-div");
    aumentaSenha = [
        {width:'60%'},
        {width:'100%', offset: 0.2},
        {width:'100%', offset: 0.8},
        {width:'60%', offset: 1},
    ];
    
    senha.animate(aumentaSenha, {duration: 5000});
}

function piscaSenha(){

    var senha = document.getElementById("tabela-senhas");
    
    senha.animate([
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 1000,
        iterations: 3
    });


}

var taChamando = 0;
var auxChamando = 0;

async function getChamando(){
    await fetch("/ta-chamando/")
    .then(function(response) {
        return response.json();
    })
    .then(function(taChamando) {
        
        if(taChamando > auxChamando){
            cresceSenha();
            getFilas();
            setTimeout(function(){
                piscaSenha();
                document.getElementById('toque').play();
            }, 1000);
            auxChamando = taChamando;
            
        }else{
            auxChamando = taChamando;
        }
        
    });
}

getFilas();
setInterval(function() {
    getChamando();
}, 1000);

setInterval(function() {
    getFilas();
}, 60 * 60 * 1000);

