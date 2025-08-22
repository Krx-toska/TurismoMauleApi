using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtService
{
    private string secureKey = "TU_CLAVE_SECRETA_MUY_LARGA"; // reemplaza con clave segura

    public string Generate(int idUsuario)
    {
        var symmetricKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secureKey));
        var credentials = new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256Signature);

        var header = new JwtHeader(credentials);
        var payload = new JwtPayload
        {
            { "sub", idUsuario },
            { "exp", DateTimeOffset.UtcNow.AddHours(8).ToUnixTimeSeconds() }
        };

        var token = new JwtSecurityToken(header, payload);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
