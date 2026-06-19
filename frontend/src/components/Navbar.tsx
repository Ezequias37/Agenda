import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav>
      <div className="container">
        <div className="logo">
          ☀️ LM BRONZEAMENTO
        </div>
        <ul>
          <li>
            <Link to="/">Início</Link>
          </li>
          <li>
            <Link to="/clientes">Clientes</Link>
          </li>
          <li>
            <Link to="/agendamentos">Agendamentos</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
