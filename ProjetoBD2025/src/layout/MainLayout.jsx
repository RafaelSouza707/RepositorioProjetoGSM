import { Container, Navbar, Nav, Dropdown, Button } from "react-bootstrap";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import IconeUsuario from "../components/InconeUsuario";

function MainLayout({ user, setUser }) {
  const navigate = useNavigate();

  // logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null); 
    navigate("/tela-login");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">PirataFlix</Navbar.Brand>
          <Nav className="ms-auto">
            {user ? (
              <Dropdown>
                <Dropdown.Toggle
                  id="dropdown-basic"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    padding: "0",
                    boxShadow: "none",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <IconeUsuario name={user.nome} />
                  <span>{user.nome}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/tela-perfil">Perfil</Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>Sair</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button as={Link} to="/tela-login" variant="light">
                Entrar
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container className="flex-grow-1 mt-4">
        <Outlet />
      </Container>

      <footer className="bg-dark text-light text-center py-3 mt-4">
        <p>© {new Date().getFullYear()} - PirataFlix</p>
      </footer>
    </div>
  );
}

export default MainLayout;
