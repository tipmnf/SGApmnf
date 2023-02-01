function contaFila(dados) {    
    var pessoasFila = document.getElementById("quantFila");
    pessoasFila.innerHTML = '';
    var numPessoas = 0
    dados.forEach(function(dado) {
        if(dado.status == 'fila'){
            numPessoas = numPessoas + 1;
        }
    });    
    
    pessoasFila.innerHTML = str(numPessoas);

    }




function getFilas(){
    fetch("/tabela-dados-fila/")
        .then(function(response) {
            return response.json();
        })
        .then(function(dados) {
            contaFila(dados);
        });
}
