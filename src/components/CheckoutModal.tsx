'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  price?: number;
  regularPrice?: number;
  isExpired?: boolean;
}

const PROFESSIONS = [
  { value: 'videomaker', label: 'Videomaker' },
  { value: 'editor', label: 'Editor' },
  { value: 'diretor de fotografia', label: 'Diretor de Fotografia' },
  { value: 'estudante', label: 'Estudante' },
  { value: 'de outras áreas do audiovisual', label: 'De outras áreas do audiovisual' },
  { value: 'não sou do audiovisual', label: 'Não sou do audiovisual' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  price = 95,
  regularPrice = 195,
  isExpired = false
}) => {
  // Modal visibility & animation
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // User Registration Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState('videomaker');

  // Address Fields
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Payment Selection: null | 'CREDIT_CARD' | 'PIX'
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX' | null>(null);
  const [useUserDataForBilling, setUseUserDataForBilling] = useState(true);

  // Credit Card Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // Process States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // PIX State
  const [pixData, setPixData] = useState<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
    paymentId: string;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  // Abandonment tracking ref
  const hasInteractedRef = useRef(false);
  const paymentCompletedRef = useRef(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setErrorMessage(null);
      paymentCompletedRef.current = false;
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Track user input for cart abandonment
  useEffect(() => {
    if (name.length > 2 || email.length > 3 || phone.length > 4) {
      hasInteractedRef.current = true;
    }
  }, [name, email, phone]);

  // Record cart abandonment if user leaves without paying
  const recordAbandonment = () => {
    if (hasInteractedRef.current && !paymentCompletedRef.current) {
      const location = [city, state, neighborhood, street ? `${street}, ${number}` : ''].filter(Boolean).join(' - ');
      const payload = {
        name,
        email,
        phone,
        location,
        profession,
        paymentMethod: paymentMethod || 'nenhum',
        reason: 'Modal fechado pelo usuário antes de concluir o pagamento'
      };

      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/checkout/abandon', JSON.stringify(payload));
        } else {
          fetch('/api/checkout/abandon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          }).catch(() => {});
        }
      } catch (_) {}
    }
  };

  // Close handler with abandonment trigger
  const handleClose = () => {
    recordAbandonment();
    onClose();
  };

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Autofill CEP via ViaCEP
  const handleCepChange = async (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setCep(formatted);

    if (raw.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setStreet(data.logradouro);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade) setCity(data.localidade);
          if (data.uf) setState(data.uf);
        }
      } catch (_) {}
    }
  };

  // Input masks
  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setCpf(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 10) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    } else if (raw.length > 6) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    setPhone(formatted);
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Sync user data to card holder if enabled
  useEffect(() => {
    if (useUserDataForBilling && name) {
      setCardHolder(name.toUpperCase());
    }
  }, [useUserDataForBilling, name]);

  // PIX Status Polling
  useEffect(() => {
    if (!pollingActive || !pixData?.paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?paymentId=${pixData.paymentId}`);
        const data = await res.json();

        if (data?.confirmed && data?.redirectUrl) {
          paymentCompletedRef.current = true;
          setPollingActive(false);
          window.location.href = data.redirectUrl;
        }
      } catch (err) {
        console.error('Erro na checagem de status PIX:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingActive, pixData]);

  // Copy PIX Code
  const copyPixCode = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    }
  };

  // Submit Handler
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!name || !email || !cpf || !phone) {
      setErrorMessage('Por favor, preencha todos os dados pessoais.');
      return;
    }

    if (!paymentMethod) {
      setErrorMessage('Selecione uma forma de pagamento (Cartão de Crédito ou PIX).');
      return;
    }

    setLoading(true);

    try {
      const addressPayload = {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        postalCode: cep
      };

      if (paymentMethod === 'PIX') {
        const res = await fetch('/api/checkout/asaas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            cpfCnpj: cpf,
            phone,
            age: age ? Number(age) : null,
            profession,
            address: addressPayload,
            billingType: 'PIX',
            isExpired
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error || 'Erro ao gerar cobrança PIX no Asaas.');
        }

        if (data?.pix) {
          setPixData({
            encodedImage: data.pix.encodedImage,
            payload: data.pix.payload,
            expirationDate: data.pix.expirationDate,
            paymentId: data.paymentId
          });
          setPollingActive(true);
        }
      } else if (paymentMethod === 'CREDIT_CARD') {
        if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
          throw new Error('Por favor, preencha todos os dados do cartão de crédito.');
        }

        const [expMonth, expYear] = cardExpiry.split('/');
        const fullYear = expYear?.length === 2 ? `20${expYear}` : expYear;

        const res = await fetch('/api/checkout/asaas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            cpfCnpj: cpf,
            phone,
            age: age ? Number(age) : null,
            profession,
            address: addressPayload,
            billingType: 'CREDIT_CARD',
            installments,
            creditCard: {
              holderName: cardHolder.toUpperCase(),
              number: cardNumber.replace(/\s/g, ''),
              expiryMonth: expMonth,
              expiryYear: fullYear,
              ccv: cardCvv
            },
            creditCardHolderInfo: {
              name: cardHolder.toUpperCase(),
              email,
              cpfCnpj: cpf.replace(/\D/g, ''),
              postalCode: cep.replace(/\D/g, '') || '00000000',
              addressNumber: number || 'S/N',
              phone: phone.replace(/\D/g, '')
            },
            isExpired
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error || 'Pagamento recusado pela operadora do cartão.');
        }

        paymentCompletedRef.current = true;
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !visible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Checkout Seguro"
    >
      <div
        className={`relative w-full max-w-xl max-h-[92vh] overflow-y-auto my-auto rounded-3xl border border-white/20 shadow-[0_32px_80px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        style={{
          background: 'rgba(20,20,24,0.95)',
          backdropFilter: 'blur(40px) saturate(190%)',
          WebkitBackdropFilter: 'blur(40px) saturate(190%)'
        }}
      >
        {/* Specular Top Rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-3xl bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold tracking-widest text-[#0071e3] uppercase">
                FLMMKR • CHECKOUT OFICIAL
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Ambiente Seguro Asaas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Masterclass Color Master | Produto
            </h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                R$ {isExpired ? regularPrice : price}
              </span>
              {!isExpired && (
                <span className="text-xs text-white/50 line-through">
                  De R$ {regularPrice}
                </span>
              )}
              <span className="text-xs text-[#2997ff] font-medium ml-1">
                Acesso Vitalício + Atualizações
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-sm text-red-200 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Não foi possível concluir</p>
                <p className="text-xs text-red-200/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* 1. DADOS DE CADASTRO */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">1</span>
                Seus Dados de Acesso
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    E-mail (para login e acesso) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    CPF (para emissão da nota fiscal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Idade
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Sua idade"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Qual a sua profissão ou área de atuação? *
                  </label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1d24] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  >
                    {PROFESSIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. ENDEREÇO */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">2</span>
                Endereço
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Rua / Avenida
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Nome da sua rua"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Número
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto / Bloco"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. FORMA DE PAGAMENTO */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">3</span>
                Método de Pagamento
              </h3>

              {/* Selector Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CREDIT_CARD');
                    setPixData(null);
                    setPollingActive(false);
                  }}
                  className={`py-3 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-[0_4px_16px_rgba(0,113,227,0.4)]'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Cartão de Crédito
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('PIX');
                  }}
                  className={`py-3 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'PIX'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-[0_4px_16px_rgba(0,113,227,0.4)]'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Pix (Instantâneo)
                </button>
              </div>

              {/* SE CARTÃO DE CRÉDITO SELECIONADO */}
              {paymentMethod === 'CREDIT_CARD' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-semibold text-white/80">
                      Dados do Cartão
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseUserDataForBilling(!useUserDataForBilling)}
                      className="text-[11px] text-[#2997ff] hover:underline cursor-pointer"
                    >
                      {useUserDataForBilling ? '✓ Usando dados do cadastro' : 'Usar dados do cadastro'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                      Nome impresso no Cartão
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value.toUpperCase());
                        setUseUserDataForBilling(false);
                      }}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                        CVV (Código de segurança)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/60 mb-1 ml-0.5">
                      Parcelamento
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1d24] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0071e3] transition-all"
                    >
                      <option value={1}>1x de R$ {(isExpired ? regularPrice : price).toFixed(2)} à vista</option>
                      <option value={2}>2x de R$ {((isExpired ? regularPrice : price) / 2).toFixed(2)}</option>
                      <option value={3}>3x de R$ {((isExpired ? regularPrice : price) / 3).toFixed(2)}</option>
                      <option value={6}>6x de R$ {((isExpired ? regularPrice : price) / 6).toFixed(2)}</option>
                      <option value={12}>12x de R$ {((isExpired ? regularPrice : price) / 12).toFixed(2)}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* SE PIX SELECIONADO */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in duration-200 text-center">
                  {!pixData ? (
                    <div className="py-4">
                      <p className="text-xs text-white/70 mb-3">
                        Clique abaixo para gerar seu QR Code Pix dinâmico com confirmação instantânea.
                      </p>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-[#0071e3]/30"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Gerar QR Code PIX (R$ {isExpired ? regularPrice : price})
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mx-auto">
                        {pixData.encodedImage ? (
                          <img
                            src={`data:image/png;base64,${pixData.encodedImage}`}
                            alt="QR Code Pix Asaas"
                            className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-zinc-900 text-xs">
                            Código gerado
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Aguardando pagamento... redirecionamento automático
                      </div>

                      {/* Pix Copia e Cola */}
                      <div className="relative max-w-sm mx-auto">
                        <input
                          type="text"
                          readOnly
                          value={pixData.payload}
                          className="w-full pr-24 pl-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white/90 font-mono truncate"
                        />
                        <button
                          type="button"
                          onClick={copyPixCode}
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {pixCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>

                      <p className="text-[11px] text-white/50">
                        Abra o app do seu banco, escolha Pix &gt; Pagar com QR Code ou Copia e Cola.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Final Submit for Credit Card */}
            {paymentMethod === 'CREDIT_CARD' && (
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[50px] py-3.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-[0_4px_24px_rgba(0,113,227,0.4)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pagar R$ {(isExpired ? regularPrice : price).toFixed(2)} com Cartão
                  </>
                )}
              </button>
            )}

            <div className="pt-2 text-center">
              <span className="text-[11px] text-white/40 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> Seus dados de pagamento são criptografados e enviados diretamente ao Asaas.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
