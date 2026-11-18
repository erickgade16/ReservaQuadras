import { useEffect, useRef, useState } from "react";

// Controla uma lista paginada no servidor: página, tamanho, busca/filtros/ordenação,
// carregamento e erro. "buscarFn" recebe { pagina (1-based), tamanho, busca, filtros,
// ordenacao, direcao } e devolve { itens, total }.
export default function useListaPaginada(buscarFn, { tamanhoInicial = 10 } = {}) {
  const [pagina, setPagina] = useState(0); // 0-based (padrão do TablePagination)
  const [tamanho, setTamanho] = useState(tamanhoInicial);
  const [consulta, setConsulta] = useState({
    busca: "",
    filtros: {},
    ordenacao: "",
    direcao: "asc",
  });

  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  const buscarRef = useRef(buscarFn);
  buscarRef.current = buscarFn;

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await buscarRef.current({
          pagina: pagina + 1,
          tamanho,
          ...consulta,
        });

        if (cancelado) return;

        // Se a última página ficou vazia (itens removidos/filtrados), volta uma página
        const ultimaPagina = Math.max(
          Math.ceil(resposta.total / tamanho) - 1,
          0
        );

        if (pagina > ultimaPagina) {
          setPagina(ultimaPagina);
          return;
        }

        setItens(resposta.itens);
        setTotal(resposta.total);
      } catch (error) {
        if (cancelado) return;
        console.error(error);
        setErro(error.message);
        setItens([]);
        setTotal(0);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [pagina, tamanho, consulta, versao]);

  return {
    itens,
    setItens,
    total,
    carregando,
    erro,
    recarregar: () => setVersao((v) => v + 1),
    servidor: {
      total,
      pagina,
      tamanho,
      onPaginaChange: setPagina,
      onTamanhoChange: (novoTamanho) => {
        setTamanho(novoTamanho);
        setPagina(0);
      },
      onConsultaChange: (novaConsulta) => {
        setConsulta(novaConsulta);
        setPagina(0);
      },
    },
  };
}
