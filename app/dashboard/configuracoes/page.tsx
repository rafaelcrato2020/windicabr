"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Camera, Check, Eye, EyeOff, Save, Upload, User, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/user-context"
import { useMobile } from "@/hooks/use-mobile"

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { profilePhoto, setProfilePhoto } = useUser()
  const isMobile = useMobile()

  const [profileData, setProfileData] = useState({
    nome: "Investidor",
    email: "investidor@email.com",
    telefone: "(11) 98765-4321",
  })

  const [tempProfileData, setTempProfileData] = useState({
    nome: "Investidor",
    email: "investidor@email.com",
    telefone: "(11) 98765-4321",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTempProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditProfile = () => {
    setIsEditing(true)
    setTempProfileData({ ...profileData })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setTempProfileData({ ...profileData })
    setPreviewImage(null)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    // Simulação de envio de dados
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Atualiza os dados do perfil
    setProfileData({ ...tempProfileData })

    // Atualiza a foto do perfil se houver uma prévia
    if (previewImage) {
      setProfilePhoto(previewImage)
    }

    setIsEditing(false)
    setSaving(false)
    setPreviewImage(null)

    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
      variant: "success",
    })
  }

  const handleChangePassword = async () => {
    setSaving(true)
    // Simulação de envio de dados
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setSaving(false)

    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
      variant: "success",
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = (type: "upload" | "camera") => {
    if (fileInputRef.current) {
      if (type === "camera") {
        fileInputRef.current.setAttribute("capture", "user")
      } else {
        fileInputRef.current.removeAttribute("capture")
      }
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden h-16 items-center">
        <div className="container flex justify-between py-4">
          <h1 className="text-xl font-bold">Configurações</h1>
        </div>
      </header>

      <div className="container py-4 md:py-6 px-4 md:px-6 space-y-6 md:space-y-8">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Foto de Perfil</CardTitle>
                    <CardDescription>Atualize sua foto de perfil.</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      className="border-green-900/50 text-green-500 hover:bg-green-900/20 w-full md:w-auto"
                      onClick={handleEditProfile}
                    >
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <div className="relative w-28 h-28 md:w-32 md:h-32">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 animate-pulse-glow"></div>
                    <div className="absolute inset-0.5 rounded-full overflow-hidden">
                      {isEditing && previewImage ? (
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Preview da foto de perfil"
                          width={128}
                          height={128}
                          className="rounded-full object-cover w-full h-full"
                        />
                      ) : (
                        <Image
                          src={profilePhoto || "/placeholder.svg?height=128&width=128"}
                          alt="Foto do perfil"
                          width={128}
                          height={128}
                          className="rounded-full object-cover w-full h-full"
                        />
                      )}
                    </div>
                    {isEditing && previewImage && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        onClick={() => setPreviewImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {isEditing ? (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <Button
                            variant="outline"
                            className="border-green-900/50 text-green-500 hover:bg-green-900/20 w-full"
                            onClick={() => triggerFileInput("upload")}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Foto
                          </Button>
                          <Button
                            variant="outline"
                            className="border-green-900/50 text-green-500 hover:bg-green-900/20 w-full"
                            onClick={() => triggerFileInput("camera")}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Tirar Foto
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 text-center md:text-left">
                        Clique em "Editar Perfil" para alterar sua foto e informações pessoais.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize suas informações de perfil.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={isEditing ? tempProfileData.nome : profileData.nome}
                      onChange={handleProfileChange}
                      className="bg-black/50 border-green-900/50"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={isEditing ? tempProfileData.email : profileData.email}
                      onChange={handleProfileChange}
                      className="bg-black/50 border-green-900/50"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={isEditing ? tempProfileData.telefone : profileData.telefone}
                      onChange={handleProfileChange}
                      className="bg-black/50 border-green-900/50"
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <>Salvando...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-900/50 text-red-500 hover:bg-red-900/20"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Atualize sua senha de acesso.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="bg-black/50 border-green-900/50 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="bg-black/50 border-green-900/50 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="bg-black/50 border-green-900/50 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500 mt-4">
                    <User className="h-4 w-4" />
                    <AlertTitle>Dica de segurança</AlertTitle>
                    <AlertDescription>
                      Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números
                      e símbolos.
                    </AlertDescription>
                  </Alert>

                  <Button
                    className="mt-4 w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
                    onClick={handleChangePassword}
                    disabled={
                      saving ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                  >
                    {saving ? (
                      <>Alterando...</>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
