"use client"
import { Modal } from "@/components/ui/modal"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

interface AuthModalsProps {
  isLoginOpen: boolean
  isRegisterOpen: boolean
  onCloseLogin: () => void
  onCloseRegister: () => void
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}

export function AuthModals({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  onSwitchToLogin,
  onSwitchToRegister,
}: AuthModalsProps) {
  return (
    <>
      <Modal isOpen={isLoginOpen} onClose={onCloseLogin} title="Login">
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
      </Modal>

      <Modal isOpen={isRegisterOpen} onClose={onCloseRegister} title="Cadastro">
        <RegisterForm onSwitchToLogin={onSwitchToLogin} />
      </Modal>
    </>
  )
}
