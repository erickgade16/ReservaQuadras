namespace ReservaQuadras.API.Entities
{
    public class Quadra
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public string Tipo { get; set; }

        public decimal PrecoHora { get; set; }

        public bool Ativa { get; set; }

        public int? DuracaoReservaMinutos { get; set; }

        // Dias da semana em que a quadra funciona, separados por vírgula.
        // Segue o DayOfWeek do .NET: 0 = domingo ... 6 = sábado. Ex.: "1,2,3,4,5"
        public string DiasFuncionamento { get; set; } = "0,1,2,3,4,5,6";

        public bool FuncionaNoDia(DayOfWeek dia)
        {
            if (string.IsNullOrWhiteSpace(DiasFuncionamento))
                return true;

            return DiasFuncionamento
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Contains(((int)dia).ToString());
        }

        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();

        public TimeSpan HoraAbertura { get; set; }

        public TimeSpan HoraFechamento { get; set; }
    }
}
