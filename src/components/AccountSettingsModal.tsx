'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, Lock, User, Mail, Phone, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getMediaUrl } from '@/lib/storage';

interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  isAdmin?: boolean;
}

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  userId?: string;
  onProfileUpdated: (updated: Partial<UserProfile>) => void;
}

const PRESET_AVATARS = [
  getMediaUrl('banners/hero_01.webp'),
  getMediaUrl('banners/hero_02.webp'),
  getMediaUrl('banners/hero_03.webp'),
  getMediaUrl('banners/hero_04.webp'),
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  userId,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'senha'>('perfil');

  // Form Profile State
  const [firstName, setFirstName] = useState(userProfile.firstName || '');
  const [lastName, setLastName] = useState(userProfile.lastName || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [avatar, setAvatar] = useState(userProfile.avatar || PRESET_AVATARS[0]);

  // Form Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pasteBlockedNotice, setPasteBlockedNotice] = useState(false);

  // Status & Loaders
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Selecione um arquivo de imagem válido (JPG, PNG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSavingProfile(true);

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          avatarUrl: avatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao atualizar dados do perfil.');
      }

      onProfileUpdated({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar,
      });

      setFeedback({ type: 'success', message: 'Dados cadastrais salvos com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao salvar alterações.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Informe sua senha atual.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível alterar a senha.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao alterar senha.' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#141416] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0071e3]/20 text-[#0071e3] flex items-center justify-center border border-[#0071e3]/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Minha Conta</h2>
              <p className="text-xs text-neutral-400">Gerencie seus dados pessoais e credenciais de acesso.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            onClick={() => { setActiveTab('perfil'); setFeedback(null); }}
            className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'perfil'
                ? 'border-[#0071e3] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User size={13} />
            Dados Pessoais
          </button>
          <button
            onClick={() => { setActiveTab('senha'); setFeedback(null); }}
            className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'senha'
                ? 'border-[#0071e3] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lock size={13} />
            Segurança & Senha
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-[#30d158]/15 border border-[#30d158]/30 text-[#30d158]' 
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* TAB 1: DADOS PESSOAIS */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Foto de Perfil */}
            <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <div className="relative group shrink-0">
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Alterar foto"
                >
                  <Camera size={16} />
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoSelect}
                />
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-white">Foto de Perfil</p>
                <p className="text-[11px] text-neutral-400">Escolha uma imagem do seu dispositivo ou selecione um preset do estúdio.</p>
                
                {/* Preset Avatars */}
                <div className="flex items-center gap-2 pt-1">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset)}
                      className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                        avatar === preset ? 'border-[#0071e3] scale-110 shadow-[0_0_8px_#0071e3]' : 'border-white/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Nome</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Sobrenome</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Seu sobrenome"
                  className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
                  required
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Mail size={12} />
                E-mail de Acesso
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
                required
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Phone size={12} />
                Número de Telefone / WhatsApp
              </label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
              />
            </div>

            {/* Botão Salvar Perfil */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SEGURANÇA & SENHA */}
        {activeTab === 'senha' && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            
            {/* Aviso anti-colagem */}
            {pasteBlockedNotice && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 animate-shake">
                <ShieldAlert size={14} className="shrink-0" />
                <span>Por motivos de segurança, a confirmação de senha não aceita colagem. Digite manualmente.</span>
              </div>
            )}

            {/* Senha Atual */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium">Senha Atual</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium">Nova Senha</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha (BLOQUEIO ESTRITO DE COLAGEM) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-400 font-medium">Confirmar Nova Senha</label>
                <span className="text-[10px] text-neutral-400 font-mono">Digitação manual</span>
              </div>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    setPasteBlockedNotice(true);
                    setTimeout(() => setPasteBlockedNotice(false), 4000);
                  }}
                  onDrop={(e) => e.preventDefault()}
                  placeholder="Repita a nova senha"
                  className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors select-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Botão Salvar Senha */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Atualizando Senha...
                  </>
                ) : (
                  'Trocar Senha'
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
