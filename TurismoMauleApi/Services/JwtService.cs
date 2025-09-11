using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TurismoMauleApi.Services
{
    public class JwtService
    {
        private readonly string _secretKey;
        private readonly double _expiryMinutes;

        public JwtService(IConfiguration config)
        {
            _secretKey = config["JwtSettings:SecretKey"]!;
            _expiryMinutes = double.Parse(config["JwtSettings:ExpiryMinutes"]!);
        }

        // Ahora recibe userId y nombre
        public string Generate(int userId, string nombre)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim("nombre", nombre)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
