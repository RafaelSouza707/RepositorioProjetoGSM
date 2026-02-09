import { Container, Navbar, Nav, Dropdown, Button } from "react-bootstrap";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import IconeUsuario from "../components/InconeUsuario";
import "./MainLayout.css";
import { FaFilm } from "react-icons/fa";
import { Person, BoxArrowRight } from "react-bootstrap-icons";


function MainLayout({ user, setUser }) {
  const navigate = useNavigate();

  // logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        variant="dark"
        className="navbar"
      >
        <div className="layout-width d-flex align-items-center w-100">
          <Navbar.Brand as={Link} to={user?.tipo === "adm" ? "/tela-adm" : "/"}
            className="navbar-logo d-flex align-items-center gap-2">
            <FaFilm size={25} />
            <span>PirataFlix</span>
          </Navbar.Brand>

          <Nav className="ms-auto align-items-center">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle className="user-toggle">
                  <IconeUsuario name={user.nome} />
                  <span>{user.nome}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu">

                  <Dropdown.Item as={Link} to="/tela-perfil" className="d-flex align-items-center gap-2">
                    <Person size={16} />
                    {user?.tipo === "adm" ? "Painel Administrativo" : "Perfil"}
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-2 text-danger">
                    <BoxArrowRight size={16} />
                    Sair
                  </Dropdown.Item>

                </Dropdown.Menu>

              </Dropdown>
            ) : (
              <Button as={Link} to="/tela-login" className="btn-login">
                Entrar
              </Button>
            )}
          </Nav>
        </div>
      </Navbar>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="text-light text-center py-3" style={{ backgroundColor: "#000000ff", marginTop: "80px" }}>
        <p>© {new Date().getFullYear()} - PirataFlix</p>
      </footer>
    </div>
  );
}

export default MainLayout;
