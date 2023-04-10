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

function montaTabelaAnteriores(dados) {    
    var corpoTabela = document.getElementById("tbodyanteriores");
    var cabecaTabela = document.getElementById("tHeader");
    cabecaTabela.innerHTML = '';
    corpoTabela.innerHTML = '';

    for (i=0; i<dados.length; i++){
        var dado = dados[i];
        if(dado.tipo == "Geral"){
            var linha = document.createElement("tr");
            
            var header = document.createElement("th");
            header.innerHTML = "Geral";
            cabecaTabela.appendChild(header);
            
            var senha = document.createElement("td");
            senha.innerHTML = dado.senha;
            linha.appendChild(senha);
            
            // var cliente = document.createElement("td");
            // cliente.innerHTML = dado.cliente;
            // linha.appendChild(cliente);
        
            // var cabine = document.createElement("td");
            // cabine.innerHTML = dado.cabine;
            // linha.appendChild(cabine);
        
            // var status = document.createElement("td");
            // status.innerHTML = dado.status;
            // linha.appendChild(status);
            
            corpoTabela.appendChild(linha);
            break;
        }      
    };
        
    for (i=0; i<dados.length; i++){
        var dado = dados[i];
        if(dado.tipo == "Alvará"){
            var linha = document.createElement("tr");
        
            var header = document.createElement("th");
            header.innerHTML = "Alvará";
            cabecaTabela.appendChild(header);

            var senha = document.createElement("td");
            senha.innerHTML = dado.senha;
            linha.appendChild(senha);
            
            // var cliente = document.createElement("td");
            // cliente.innerHTML = dado.cliente;
            // linha.appendChild(cliente);
        
            // var cabine = document.createElement("td");
            // cabine.innerHTML = dado.cabine;
            // linha.appendChild(cabine);
        
            // var status = document.createElement("td");
            // status.innerHTML = dado.status;
            // linha.appendChild(status);
        
            corpoTabela.appendChild(linha);
            break;
        }      
    };

    for (i=0; i<dados.length; i++){
        var dado = dados[i];
        if(dado.tipo == "Processos"){
            var linha = document.createElement("tr");
        
            var header = document.createElement("th");
            header.innerHTML = "Processos";
            cabecaTabela.appendChild(header);

            var senha = document.createElement("td");
            senha.innerHTML = dado.senha;
            linha.appendChild(senha);
            
            // var cliente = document.createElement("td");
            // cliente.innerHTML = dado.cliente;
            // linha.appendChild(cliente);
        
            // var cabine = document.createElement("td");
            // cabine.innerHTML = dado.cabine;
            // linha.appendChild(cabine);
        
            // var status = document.createElement("td");
            // status.innerHTML = dado.status;
            // linha.appendChild(status);
        
            corpoTabela.appendChild(linha);
            break;
        }      
    };
}

async function getFilas(){
        await fetch("/tabela-dados/")
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
        {width:'50%'},
        {width:'100%', offset: 0.2},
        {width:'100%', offset: 0.8},
        {width:'50%', offset: 1},
    ];
    
    senha.animate(aumentaSenha, {duration: 5000});
}

// function encolheSenha(){
//     var senha = document.getElementById("minha-div");
//     var video = document.getElementById("videoDisplay");
//     senha.style.width = '30%';
//     senha.style.height = '55%';
//     video.style.width = '70%';
//     video.style.height = '45%';
// }

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
            setTimeout(function(){
                getFilas();
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
}, 60 * 60 *1000);


