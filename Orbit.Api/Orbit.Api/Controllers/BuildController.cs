using Microsoft.AspNetCore.Mvc;

namespace Orbit.Api.Controllers
{
    public class BuildController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
