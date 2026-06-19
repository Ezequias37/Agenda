interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-box">
      <strong>❌ Erro</strong>
      <p>{message}</p>
    </div>
  );
}
