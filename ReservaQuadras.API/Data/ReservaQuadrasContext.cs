using ReservaQuadras.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace ReservaQuadras.API.Data
{
    public class ReservaQuadrasContext : DbContext
    {
        public ReservaQuadrasContext(
            DbContextOptions<ReservaQuadrasContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Quadra> Quadras { get; set; }

        public DbSet<Reserva> Reservas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Quadras já cadastradas passam a funcionar todos os dias
            modelBuilder.Entity<Quadra>()
                .Property(q => q.DiasFuncionamento)
                .HasDefaultValue("0,1,2,3,4,5,6");
        }
    }
}
