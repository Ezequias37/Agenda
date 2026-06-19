import type { Cliente } from '../types';

interface ClientCardProps {
  cliente: Cliente;
}

export function ClientCard({ cliente }: ClientCardProps) {
  return (
    <div className="item-card">
      <h3>👤 {cliente.nome}</h3>
      <p>📧 <strong>{cliente.email}</strong></p>
      <p>📱 {cliente.telefone}</p>
    </div>
  );
}
