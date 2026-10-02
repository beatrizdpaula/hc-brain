{{--
  TEMA ANTES DA PRIMEIRA PINTURA
  O atributo precisa estar no <html> antes das folhas de estilo. Aplicado
  depois, pelo script da tela, o primeiro quadro sairia escuro e clarearia na
  frente de quem abriu — o mesmo defeito que a gaveta tinha.

  Por isso a escolha mora numa chave própria do localStorage, e não dentro do
  estado serializado do app: aqui a renderização está parada esperando este
  script, e ler uma string custa menos (e falha menos) que desserializar um
  JSON inteiro. A chave é a mesma de resources/js/comum/tema.ts.

  Este trecho é incluído por todo layout — app, login e páginas de erro —
  para que nenhuma tela abra no tema errado.
--}}
<script>
  (function () {
    var escolha = null;
    try {
      escolha = localStorage.getItem("hcBrainTema");
    } catch (erro) {
      // Modo privado: vale a preferência do sistema.
    }
    var claro =
      escolha === "claro" ||
      (escolha !== "escuro" && matchMedia("(prefers-color-scheme: light)").matches);
    document.documentElement.dataset.tema = claro ? "claro" : "escuro";
  })();
</script>
