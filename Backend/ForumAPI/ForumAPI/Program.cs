using ForumAPI.DataContext;
using ForumAPI.Handlers;
using ForumAPI.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.Text;

// --------- BUILDER SETTINGS ----------

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region Frontend Policies

string angularCorsPolicy = "AngularCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(angularCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

#endregion

builder.Services.AddControllers();

#region JWT Config

builder.Services.Configure<JWTSettings>(options =>
{
    options.SecretKey = builder.Configuration["JwtSettings:SecretKey"]
        ?? throw new InvalidOperationException("JWT Secret Key is not configured");
});

var jwtSection = builder.Configuration.GetSection("JWTSettings");
builder.Services.Configure<JWTSettings>(jwtSection);

var appSettings = jwtSection.Get<JWTSettings>();
var key = Encoding.ASCII.GetBytes(appSettings!.SecretKey);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("BasicAuthentication", null)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = builder.Environment.IsProduction();
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token))
                {
                    context.Token = context.Request.Cookies["accessToken"];
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("role", "ADMIN"));

    options.AddPolicy("UserOrAdmin", policy =>
        policy.RequireClaim("role", "USER", "ADMIN"));

    options.AddPolicy("BasicAuth", policy =>
        policy.AddAuthenticationSchemes("BasicAuthentication")
              .RequireAuthenticatedUser());

    options.AddPolicy("JwtAuth", policy =>
        policy.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
              .RequireAuthenticatedUser());
});

#endregion

#region Database Settings

var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("ForumContext"));
dataSourceBuilder.MapEnum<Role>("role");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ForumContext>(options
    => options.UseNpgsql(dataSource, o => o.MapEnum<Role>("role")));

#endregion

// ---------- APP SETTINGS ----------

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(angularCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
