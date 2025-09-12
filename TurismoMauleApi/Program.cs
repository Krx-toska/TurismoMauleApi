using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Data;
using TurismoMauleApi.Models;
using TurismoMauleApi.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Config DB SQLite
builder.Services.AddDbContext<TurismoContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});


// 🔹 JWT para validación de endpoints
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// 🔹 Registro de IHttpClientFactory para GPTController
builder.Services.AddHttpClient();

// 🔹 Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔹 Swagger en dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔹 Servir index.html y archivos estáticos
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowAll");
app.UseHttpsRedirection();

// 🔹 Routing + Auth middlewares
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 🔹 Crear DB y usuario admin por defecto si no existe
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TurismoContext>();
    db.Database.EnsureCreated();

    if (!db.Usuarios.Any())
    {
        var admin = new Usuario
        {
            Nombre = "Admin",
            Email = "admin@admin.com",
            PasswordHash = PasswordHelper.HashPassword("admin123"),
            Role = "Admin"
        };
       db.Usuarios.Add(admin);
       db.SaveChanges();
    }
}

app.Run();
