import AuthForm from '../components/auth/AuthForm'

export default function CustomerSignup({ onNavigate, onSignupSuccess }) {
  return <AuthForm role="customer" mode="signup" onNavigate={onNavigate} onSuccess={onSignupSuccess} />
}
