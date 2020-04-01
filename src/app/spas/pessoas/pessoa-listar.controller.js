angular.module("hackaton-stefanini").controller("PessoaListarController", PessoaListarController);
PessoaListarController.$inject = [
  "$rootScope", 
  "$scope", 
  "$location",
  "$q", 
  '$filter', 
  '$routeParams', 
  'HackatonStefaniniService'];

function PessoaListarController(
  $rootScope, 
  $scope, 
  $location,
  $q, 
  $filter, 
  $routeParams, 
  HackatonStefaniniService) {

  vm = this;

  vm.qtdPorPagina = 5;
  vm.ultimoIndex = 0;
  vm.totalResultados = 0;
  vm.paginaAtual = 0;

  vm.url = "http://localhost:8080/treinamento/api/pessoas/";
  vm.urlPaginada = "http://localhost:8080/treinamento/api/pessoas/paginadas?"
  vm.urlEndereco = "http://localhost:8080/treinamento/api/enderecos/";

  vm.init = function () {
    vm.paginaAtual = 1;
    vm.paginar();
  };
   
  vm.paginar = function () {
    HackatonStefaniniService.listar(
      vm.urlPaginada + "indexAtual=" + vm.ultimoIndex + "&qtdPagina=" + vm.qtdPorPagina
      ).then(
        function (responsePessoas) {
          console.log(responsePessoas.data);
          vm.listaPessoas = responsePessoas.data.resultados;
          vm.qtdPaginacao = new Array(responsePessoas.data.totalPaginas);
        }
      );
  }

  vm.atualizarPaginanacao = function (index) {
    vm.paginaAtual = index + 1;
    vm.ultimoIndex = index * vm.qtdPorPagina;
    vm.paginar();
  };

  vm.avancarPaginanacao = function () {
    vm.atualizarPaginanacao(vm.paginaAtual);
  };

  vm.retrocederPaginanacao = function () {
    if(vm.paginaAtual > 1) {
      vm.atualizarPaginanacao(vm.paginaAtual - 2);
    }
  };

  vm.editar = function (id) {
    if (id !== undefined)
      $location.path("EditarPessoas/" + id);
    else
      $location.path("cadastrarPessoa");
  }

  vm.remover = function (pessoa) {
    if(pessoa.enderecos.length > 0 || pessoa.perfils.length > 0){
      if(pessoa.enderecos.length > 0 && pessoa.perfils.length > 0){
        alert("Pessoa com Endereço e Perfil vinculado, exclusão não permitida");
      } else if (pessoa.enderecos.length > 0) {
        alert("Pessoa com Endereço vinculado, exclusão não permitida");
      } else {
        alert("Pessoa com Perfil vinculado, exclusão não permitida");
      }
    } else {
      HackatonStefaniniService.excluir(vm.url + pessoa.id).then(
        function (response) {
          console.log(response);
          vm.paginar();
        }
      );
    }
  }

  vm.retornarTelaListagem = function () {
    $location.path("listarPessoas");
  }

}
