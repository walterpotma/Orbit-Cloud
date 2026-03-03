using Microsoft.AspNetCore.Mvc;

namespace Orbit.Api.Controllers
{
    [ApiExplorerSettings(IgnoreApi = true)] // Oculta essas rotas do Swagger
    public class FeedbackController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public FeedbackController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [Route("feedback/{code}")]
        public IActionResult GetErrorPage(int code)
        {
            string fileName = $"error{code}.html";
            string filePath = Path.Combine(_env.WebRootPath, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                filePath = Path.Combine(_env.WebRootPath, "index.html");
            }

            return PhysicalFile(filePath, "text/html");
        }
    }
}