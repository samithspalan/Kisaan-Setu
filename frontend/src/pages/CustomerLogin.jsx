import AuthForm from '../components/auth/AuthForm'

export default function CustomerLogin({ onNavigate, onLoginSuccess }) {
  return <AuthForm role="customer" mode="login" onNavigate={onNavigate} onSuccess={onLoginSuccess} />
}
