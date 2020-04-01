angular.module("hackaton-stefanini").controller("PerfilIncluirAlterarController", PerfilIncluirAlterarController);
PerfilIncluirAlterarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  "$filter",
  "$routeParams",
  "HackatonStefaniniService"];

function PerfilIncluirAlterarController(
  $rootScope,
  $scope,
  $location,
  $q,
  $filter,
  $routeParams,
  HackatonStefaniniService) {

  /**ATRIBUTOS DA TELA */
  vm = this;

  vm.perfilExibicao = {
    id: null,
    nome: "",
    descricao: "",
    dataHoraInclusao: "",
    dataHoraAlteracao: "",
  }

  vm.perfil = {
    id: null,
    nome: "",
    descricao: "",
    dataHoraInclusao: null,
    dataHoraAlteracao: null,
  }

  vm.urlPerfil = "http://localhost:8080/treinamento/api/perfils/";

  /**METODOS DE INICIALIZACAO */
  vm.init = function () {

    vm.tituloTela = "Cadastrar Perfil";
    vm.acao = "Cadastrar";
    
    if ($routeParams.idPerfil) {
      vm.tituloTela = "Editar Perfil";
      vm.acao = "Editar";

      vm.recuperarObjetoPorIDURL($routeParams.idPerfil, vm.urlPerfil).then(
        function (perfilRetorno) {
          if (perfilRetorno !== undefined) {
            vm.perfil = angular.copy(perfilRetorno);
            vm.perfilExibicao = angular.copy(perfilRetorno);
            vm.perfilExibicao.dataHoraInclusao = vm.formataDataTela(vm.perfilExibicao.dataHoraInclusao);
            if (perfilRetorno.dataHoraAlteracao !== undefined) {
              vm.perfilExibicao.dataHoraAlteracao = vm.formataDataTela(vm.perfilExibicao.dataHoraAlteracao);
            } 
          }
        }
      );
    }
  };

  /**METODOS DE TELA */
  vm.cancelar = function () {
    vm.retornarTelaListagem();
  };

  vm.retornarTelaListagem = function () {
    $location.path("listarPerfis");
  };

  vm.incluir = function () {
    var deferred = $q.defer();

    var d = new Date().toISOString();
    d = d.substring(0, d.length - 5);
    
    if (vm.acao == "Cadastrar") {
      vm.perfil.dataHoraInclusao = d;
      var objectDados = angular.copy(vm.perfil);
      vm.salvar(vm.urlPerfil, objectDados).then(
        function (perfilRetorno) {
          vm.retornarTelaListagem();
        });
    } else if (vm.acao == "Editar") {
      vm.perfil.dataHoraAlteracao = d;
      var objectDados = angular.copy(vm.perfil);
      vm.alterar(vm.urlPerfil, objectDados).then(
        function (perfilRetorno) {
          vm.retornarTelaListagem();
        });
    }
  };

  vm.remover = function (objeto, tipo) {

    var url = vm.urlPerfil + objeto.id;

    vm.excluir(url).then(
      function (ojetoRetorno) {
        vm.retornarTelaListagem();
      });
  };

  /**METODOS DE SERVICO */
  vm.recuperarObjetoPorIDURL = function (id, url) {

    var deferred = $q.defer();
    HackatonStefaniniService.listarId(url + id).then(
      function (response) {
        if (response.data !== undefined)
          deferred.resolve(response.data);
        else
          deferred.resolve(vm.enderecoDefault);
      }
    );
    return deferred.promise;
  };

  vm.salvar = function (url, objeto) {
    var deferred = $q.defer();
    var obj = JSON.stringify(objeto);
    HackatonStefaniniService.incluir(url, obj).then(
      function (response) {
        if (response.status == 200) {
          deferred.resolve(response.data);
        }
      }
    );
    return deferred.promise;
  }

  vm.alterar = function (url, objeto) {

    var deferred = $q.defer();
    var obj = JSON.stringify(objeto);
    HackatonStefaniniService.alterar(url, obj).then(
      function (response) {
        if (response.status == 200) {
          deferred.resolve(response.data);
        }
      }
    );
    return deferred.promise;
  }

  vm.excluir = function (url, objeto) {

    var deferred = $q.defer();
    HackatonStefaniniService.excluir(url).then(
      function (response) {
        if (response.status == 200) {
          deferred.resolve(response.data);
        }
      }
    );
    return deferred.promise;
  }

  /**METODOS AUXILIARES */
  vm.formataDataJava = function (data) {
    var dia = data.slice(0, 2);
    var mes = data.slice(2, 4);
    var ano = data.slice(4, 8);

    return ano + "-" + mes + "-" + dia;
  };

  vm.formataDataTela = function (data) {
    var ano = data.slice(0, 4);
    var mes = data.slice(5, 7);
    var dia = data.slice(8, 10);

    return dia + "/" + mes + "/" + ano;
  };

}