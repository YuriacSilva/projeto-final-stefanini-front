angular.module("hackaton-stefanini").controller("PessoaIncluirAlterarController", PessoaIncluirAlterarController);
PessoaIncluirAlterarController.$inject = [
  "$rootScope",
  "$scope",
  "$location",
  "$q",
  "$filter",
  "$routeParams",
  "HackatonStefaniniService",
  "EnderecoService"];

function PessoaIncluirAlterarController(
  $rootScope,
  $scope,
  $location,
  $q,
  $filter,
  $routeParams,
  HackatonStefaniniService,
  EnderecoService) {

  /**ATRIBUTOS DA TELA */
  const vm = this;

  vm.pessoa = {
    id: null,
    nome: "",
    email: "",
    dataNascimento: null,
    enderecos: [],
    perfils: [],
    situacao: false,
    imagem: ""
  };
  vm.enderecoDefault = {
    id: null,
    idPessoa: null,
    cep: "",
    uf: "",
    localidade: "",
    bairro: "",
    logradouro: "",
    complemento: ""
  };

  vm.enderecosMem = [];
  vm.isEdicaoEndereco = false;
  vm.indexEdicaoEndereco = 0;
  vm.perfisCadastrados = [];
  vm.foto;
  vm.dadosAnexo;
  vm.imagemPadrao = "../../../../app/imagens/default_portrait.jpg";

  vm.service = EnderecoService;

  vm.urlEndereco = "http://localhost:8080/treinamento/api/enderecos/";
  vm.urlPerfil = "http://localhost:8080/treinamento/api/perfils/";
  vm.urlPessoa = "http://localhost:8080/treinamento/api/pessoas/";

  /**METODOS DE INICIALIZACAO */
  vm.init = function () {

    vm.tituloTela = "Cadastrar Pessoa";
    vm.acao = "Cadastrar";


    /**Recuperar a lista de perfil */
    vm.listar(vm.urlPerfil).then(
      function (response) {
        if (response !== undefined) {
          vm.listaPerfil = response;
          if ($routeParams.idPessoa) {
            vm.tituloTela = "Editar Pessoa";
            vm.acao = "Editar";
            vm.recuperarObjetoPorIDURL($routeParams.idPessoa, vm.urlPessoa).then(
              function (pessoaRetorno) {
                if (pessoaRetorno !== undefined) {
                  vm.pessoa = angular.copy(pessoaRetorno);
                  vm.perfisCadastrados = angular.copy(pessoaRetorno.perfils);
                  vm.pessoa.dataNascimento = vm.formataDataTela(pessoaRetorno.dataNascimento);
                  vm.perfil = angular.copy(vm.pessoa.perfils);
                  console.log(pessoaRetorno);
                  // vm.pessoa.perfils = [];
                }
              }
            );
          }
        }
      }
    );
  };

  /**METODOS DE TELA */
  vm.cancelar = function () {
    vm.retornarTelaListagem();
  };

  vm.retornarTelaListagem = function () {
    $location.path("listarPessoas");
  };

  vm.abrirModal = function (endereco, index) {
    $("#modalEndereco").modal();
    vm.isEdicaoEndereco = !!endereco;
    if (endereco) {
      vm.indexEdicaoEndereco = index;
      vm.service.endereco = angular.copy(endereco);
      vm.service.tituloTela = "Editar Endereço";
    } else {
      vm.service.endereco = angular.copy(vm.enderecoDefault);
      vm.service.tituloTela = "Cadastrar Endereço";
    }
  };

  vm.limparTela = function () {
    $("#modalEndereco").modal("toggle");
    vm.endereco = undefined;
  };

  vm.incluir = function () {
    
    var objetoDados = angular.copy(vm.pessoa);
    
    objetoDados.dataNascimento = vm.formataDataJava(vm.pessoa.dataNascimento);
    
    vm.enviarArquivo();
    objetoDados.imagem = angular.copy(vm.dadosAnexo);
    
    var listaEndereco = [];
    angular.forEach(objetoDados.enderecos, function (value, key) {
      if (value.complemento.length > 0) {
        value.idPessoa = objetoDados.id;
        listaEndereco.push(angular.copy(value));
      }
    });

    if(vm.acao == "Cadastrar"){
      objetoDados.enderecos = [];
    }

    if (vm.perfil !== null) {
      
      var isNovoPerfil = true;
      
      angular.forEach(objetoDados.perfils, function (value, key) {
        if (value.id === vm.perfil.id) {
          isNovoPerfil = false;
        }
      });
      if (isNovoPerfil)
      objetoDados.perfils = vm.perfil;
    }
    if (vm.acao == "Cadastrar") {
      vm.salvar(vm.urlPessoa, objetoDados).then(
        function (pessoaRetorno) {
          listaEndereco.forEach(end => end.idPessoa = pessoaRetorno.id);
          pessoaRetorno.enderecos = angular.copy(listaEndereco);
          vm.alterar(vm.urlPessoa, pessoaRetorno).then(
            function () {
              vm.retornarTelaListagem();
            });
        });
    } else if (vm.acao == "Editar") {
      
      vm.alterar(vm.urlPessoa, objetoDados).then(
        function () {
          vm.retornarTelaListagem();
        }
      );
    }
  };

  vm.remover = function (objeto, tipo, index) {

    if(confirm("Deseja realmente deletar este endereço?")){
      if(objeto.id){
        var url = vm.urlEndereco + objeto.id;
        vm.excluir(url).then(
          function (ojetoRetorno) {
            vm.init();
          });
      } else {
        vm.pessoa.enderecos.splice(index, 1);
      }
    }
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

  vm.listar = function (url) {

    var deferred = $q.defer();
    HackatonStefaniniService.listar(url).then(
      function (response) {
        if (response.data !== undefined) {
          deferred.resolve(response.data);
        }
      }
    );
    return deferred.promise;
  }

  vm.salvar = function (url, objeto) {

    var deferred = $q.defer();
    var obj = JSON.stringify(objeto);
    HackatonStefaniniService.incluir(url, obj).then(
      function (response) {
        if (response.status == 200) {
          deferred.resolve(response.data);
        } else {
          vm.pessoa.dataNascimento = vm.formataDataTela(vm.pessoa.dataNascimento);
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

  vm.salvarEndereco = function (endereco) {
    if (
      endereco.cep == null ||
      endereco.uf == null ||
      endereco.localidade == null ||
      endereco.bairro == null ||
      endereco.logradouro == null ||
      endereco.complemento == null
      ) {
        alert("Todos os campos de Endereço são obrigatórios, favor verificar o preenchimento de todos os campos.");
    } else if (endereco.id) {
      vm.alterar(vm.urlEndereco, endereco).then(
        function () {
          vm.init();
          vm.limparTela();
        });
    } else {
      if(vm.acao == "Editar"){
        endereco.idPessoa = vm.pessoa.id;
        vm.salvar(vm.urlEndereco, endereco).then(
          function () {
            vm.init();
          });
      } else {
        if(vm.isEdicaoEndereco){
          vm.pessoa.enderecos[vm.indexEdicaoEndereco] = angular.copy(endereco);
        } else {
          vm.pessoa.enderecos.push(angular.copy(endereco));
        }
      }
      vm.limparTela();
    }
    vm.service.limpar();
  }

  vm.enviarArquivo = function(){
    vm.dadosAnexo = angular.copy($("#imagem").attr("src"));
    console.log(vm.foto);
  }

  vm.exibirImagem = function () {
    var preview = document.getElementById("imagem");
    var file = document.querySelector('input[type=file').files[0];
    var reader = new FileReader();

    console.log(document.querySelector('input[type=file').files);

    reader.onloadend = function () {
        preview.src = reader.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
    vm.enviarArquivo();
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

    return dia + mes + ano;
  };
  


  vm.listaUF = [
    { "id": "RO", "desc": "RO" },
    { "id": "AC", "desc": "AC" },
    { "id": "AM", "desc": "AM" },
    { "id": "RR", "desc": "RR" },
    { "id": "PA", "desc": "PA" },
    { "id": "AP", "desc": "AP" },
    { "id": "TO", "desc": "TO" },
    { "id": "MA", "desc": "MA" },
    { "id": "PI", "desc": "PI" },
    { "id": "CE", "desc": "CE" },
    { "id": "RN", "desc": "RN" },
    { "id": "PB", "desc": "PB" },
    { "id": "PE", "desc": "PE" },
    { "id": "AL", "desc": "AL" },
    { "id": "SE", "desc": "SE" },
    { "id": "BA", "desc": "BA" },
    { "id": "MG", "desc": "MG" },
    { "id": "ES", "desc": "ES" },
    { "id": "RJ", "desc": "RJ" },
    { "id": "SP", "desc": "SP" },
    { "id": "PR", "desc": "PR" },
    { "id": "SC", "desc": "SC" },
    { "id": "RS", "desc": "RS" },
    { "id": "MS", "desc": "MS" },
    { "id": "MT", "desc": "MT" },
    { "id": "GO", "desc": "GO" },
    { "id": "DF", "desc": "DF" }
  ];

}
