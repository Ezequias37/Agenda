export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <div className="app-footer-col">
          <h4>Suporte</h4>
          <p>📞 (31) 99260-5956</p>
          <p>✉️ ezequias.nunes37@gmail.com</p>
          <p>🕐 Seg–Sex, 9h–18h</p>
        </div>

        <div className="app-footer-col app-footer-col-badges">
          <h4>Sistema Robusto</h4>
          <div className="app-footer-badges">
            <span>🔒 Dados Seguros</span>
            <span>🏢 Multi-empresa</span>
            <span>🎨 White-Label</span>
            <span>📜 LGPD</span>
            <span>☁️ Alta Disponibilidade</span>
          </div>
        </div>

        <div className="app-footer-col app-footer-brand">
          <p>© 2026 CLICKAGENDA. Todos os direitos reservados.</p>
          <p>Tecnologia CLICKAGENDA</p>
          <p className="app-footer-version">Versão 2.0.0</p>
        </div>
      </div>
    </footer>
  );
}
