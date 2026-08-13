namespace ReservaQuadras.API.Entities
{
    public class Reserva
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }

        public int QuadraId { get; set; }

        public DateTime DataReserva { get; set; }

        public TimeSpan HoraInicio { get; set; }

        public TimeSpan HoraFim { get; set; }

        public string Status { get; set; } = "ATIVA";

        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        public Usuario? Usuario { get; set; }

        public Quadra? Quadra { get; set; }
    }
}
