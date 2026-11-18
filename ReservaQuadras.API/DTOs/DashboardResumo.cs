namespace ReservaQuadras.API.DTOs;

public class DashboardResumo
{
    public int ReservasHoje { get; set; }

    public int ReservasMes { get; set; }

    public int QuadrasAtivas { get; set; }

    public int QuadrasTotal { get; set; }

    public int UsuariosAtivos { get; set; }

    public int UsuariosTotal { get; set; }

    public decimal ReceitaMes { get; set; }

    public List<ReservaListaItem> Proximas { get; set; } = new();

    public List<RankingQuadra> Ranking { get; set; } = new();
}

public class RankingQuadra
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public int Total { get; set; }
}
