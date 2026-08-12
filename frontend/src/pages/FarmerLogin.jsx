import AuthForm from '../components/auth/AuthForm'

export default function FarmerLogin({ onNavigate, onLoginSuccess }) {
  return <AuthForm role="farmer" mode="login" onNavigate={onNavigate} onSuccess={onLoginSuccess} />
}
