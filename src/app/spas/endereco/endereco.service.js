angular.module("hackaton-stefanini").service("EnderecoService", EnderecoService);
EnderecoService.$inject = [];

function EnderecoService() {

  const vm = this;

  vm.tituloTela = "Cadastrar Endereço";

  vm.endereco = {
    cep: "",
    uf: "",
    localidade: "",
    bairro: "",
    logradouro: "",
    complemento: ""
  }

  vm.limpar = function () {
    vm.endereco = {
      cep: "",
      uf: "",
      localidade: "",
      bairro: "",
      logradouro: "",
      complemento: ""
    }
  }
}

