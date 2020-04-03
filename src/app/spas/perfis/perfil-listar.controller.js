angular.module("hackaton-stefanini").controller("PerfilListarController", PerfilListarController);
PerfilListarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  '$filter',
  '$routeParams',
  'HackatonStefaniniService'];

function PerfilListarController(
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

  vm.url = "http://localhost:8080/treinamento/api/perfils/";
  vm.urlPaginada = "http://localhost:8080/treinamento/api/perfils/paginados?";

  vm.init = function () {
    vm.paginaAtual = 1;
    vm.paginar();
  };

  vm.paginar = function () {
    HackatonStefaniniService.listar(
      vm.urlPaginada + "indexAtual=" + vm.ultimoIndex + "&qtdPagina=" + vm.qtdPorPagina
      ).then(
        function (responsePerfis) {
          console.log(responsePerfis.data);
          vm.listaPerfis = responsePerfis.data.resultados;
          vm.qtdPaginacao = new Array(responsePerfis.data.totalPaginas);
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
      $location.path("EditarPerfis/" + id);
    else 
      $location.path("cadastrarPerfil");
  }

  vm.remover = function (id) {

    var liberaExclusao = true;

    angular.forEach(vm.listaPessoa, function (value, key) {
      if (value.idPerfil === id)
        liberaExclusao = false;
    });

    if (liberaExclusao)
      HackatonStefaniniService.excluir(vm.url + id).then(
        function (response) {
          vm.init();
        }
      );
    else {
      alert("Perfil com Pessoa vinculada, exclusão não permitida");
    }
  }

  vm.retornarTelaListagem = function () {
    $location.path("listarPerfis");
  }

}
