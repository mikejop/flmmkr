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
  ArrowRight,
  UserCheck,
  UserPlus,
  ChevronDown,
  Edit2,
  Mail
} from 'lucide-react';
import { getAsaasInstallmentValue } from '@/utils/asaasPricing';
import { PhoneInputWithDdi } from '@/components/PhoneInputWithDdi';
import { TermsModal } from '@/components/TermsModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  price?: number;
  regularPrice?: number;
  isExpired?: boolean;
  macAddress?: string;
  hasDiscount25?: boolean;
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
  isExpired = false,
  macAddress,
  hasDiscount25 = false
}) => {
  // Modal visibility & animation
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // User Registration Fields (Aluno)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState(''); // Começa em vazio ("Escolher")

  // Address Fields (Aluno)
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  // Billing Mode Switch: 'same' = Usar dados do cadastro | 'different' = Adicionar dados diferentes do cadastro
  const [billingMode, setBillingMode] = useState<'same' | 'different'>('same');

  // Payer / Billing Fields (quando diferentes do cadastro)
  const [payerName, setPayerName] = useState('');
  const [payerCpf, setPayerCpf] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerCep, setPayerCep] = useState('');
  const [payerStreet, setPayerStreet] = useState('');
  const [payerNumber, setPayerNumber] = useState('');
  const [payerComplement, setPayerComplement] = useState('');
  const [payerNeighborhood, setPayerNeighborhood] = useState('');
  const [payerCity, setPayerCity] = useState('');
  const [payerState, setPayerState] = useState('');
  const [loadingPayerCep, setLoadingPayerCep] = useState(false);

  // Payment Selection: null | 'CREDIT_CARD' | 'PIX'
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX' | null>(null);

  // Credit Card Specific Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // Process States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Accordion / Wizard Steps: 1 = Dados de Cadastro | 2 = Endereço | 3 = Método de Pagamento
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // PIX State
  const [pixData, setPixData] = useState<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
    paymentId: string;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [emailActivationSent, setEmailActivationSent] = useState(false);
  const [activationRecipientEmail, setActivationRecipientEmail] = useState('');

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

  // Transição automática das abas (sem botões intermediários):
  // Ao terminar de preencher todos os dados obrigatórios da etapa ativa (em qualquer ordem),
  // minimiza a aba atual e maximiza automaticamente a próxima etapa com animação suave.
  const hasAutoAdvancedStep1Ref = useRef(false);
  const hasAutoAdvancedStep2Ref = useRef(false);

  // Reseta os flags de avanço automático caso o modal seja reaberto
  useEffect(() => {
    if (isOpen) {
      hasAutoAdvancedStep1Ref.current = false;
      hasAutoAdvancedStep2Ref.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Transição automática de 1 (Dados) -> 2 (Endereço)
    if (activeStep === 1 && !hasAutoAdvancedStep1Ref.current && isStep1Complete()) {
      hasAutoAdvancedStep1Ref.current = true;
      const timer = setTimeout(() => {
        setActiveStep(2);
      }, 450);
      return () => clearTimeout(timer);
    }

    // Transição automática de 2 (Endereço) -> 3 (Pagamento)
    if (activeStep === 2 && !hasAutoAdvancedStep2Ref.current && isStep2Complete()) {
      hasAutoAdvancedStep2Ref.current = true;
      const timer = setTimeout(() => {
        setActiveStep(3);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeStep, name, email, cpf, phone, birthDate, profession, cep, street, number, neighborhood, city, state]);

  // Track user input for cart abandonment
  useEffect(() => {
    if (name.length > 2 || email.length > 3 || phone.length > 4) {
      hasInteractedRef.current = true;
    }
  }, [name, email, phone]);

  // Record cart abandonment if user leaves without paying
  const recordAbandonment = () => {
    if (hasInteractedRef.current && !paymentCompletedRef.current) {
      let attr: any = null;
      try {
        const stored = localStorage.getItem('flmmkr_traffic_attribution');
        if (stored) attr = JSON.parse(stored);
      } catch {}

      const location = [city, state, neighborhood, street ? `${street}, ${number}` : ''].filter(Boolean).join(' - ');
      const payload = {
        name,
        email,
        phone,
        location,
        profession: profession || 'Não informada',
        paymentMethod: paymentMethod || 'nenhum',
        reason: 'Modal fechado pelo usuário antes de concluir o pagamento',
        trafficSource: attr?.sourceName || undefined,
        deviceFingerprint: attr?.deviceFingerprint || macAddress || undefined,
        utmSource: attr?.utmSource || undefined,
        referrer: attr?.referrer || undefined
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

  // Helper para consulta segura de CEP via endpoint próprio do servidor (Brasil API com fallback)
  const fetchAddressByCep = async (rawCep: string, isPayer = false) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    if (isPayer) setLoadingPayerCep(true);
    else setLoadingCep(true);

    try {
      const res = await fetch(`/api/cep?cep=${clean}`);
      const data = await res.json();

      if (res.ok && data?.success) {
        if (isPayer) {
          if (data.street) setPayerStreet(data.street);
          if (data.neighborhood) setPayerNeighborhood(data.neighborhood);
          if (data.city) setPayerCity(data.city);
          if (data.state) setPayerState(data.state);
        } else {
          if (data.street) setStreet(data.street);
          if (data.neighborhood) setNeighborhood(data.neighborhood);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
        }
      }
    } catch (err) {
      console.warn('Erro ao consultar CEP via servidor:', err);
    } finally {
      if (isPayer) setLoadingPayerCep(false);
      else setLoadingCep(false);
    }
  };

  // Input masks
  const handleBirthDateChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setBirthDate(formatted);
  };

  const calculateAge = (dateStr: string): number | null => {
    const parts = dateStr.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const birth = new Date(year, month, day);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let calculated = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          calculated--;
        }
        return calculated >= 0 && calculated < 120 ? calculated : null;
      }
    }
    return null;
  };

  const handleCepChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setCep(formatted);
    if (raw.length === 8) {
      fetchAddressByCep(raw, false);
    }
  };

  const handlePayerCepChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setPayerCep(formatted);
    if (raw.length === 8) {
      fetchAddressByCep(raw, true);
    }
  };

  const formatCpf = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length > 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    if (raw.length > 6) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    if (raw.length > 3) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
    return raw;
  };

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length > 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    if (raw.length > 6) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    if (raw.length > 2) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return raw;
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

  // Sync card holder default if using same registration data
  useEffect(() => {
    if (billingMode === 'same' && name && !cardHolder) {
      setCardHolder(name.toUpperCase());
    } else if (billingMode === 'different' && payerName) {
      setCardHolder(payerName.toUpperCase());
    }
  }, [billingMode, name, payerName]);

  // PIX Status Polling
  useEffect(() => {
    if (!pollingActive || !pixData?.paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?paymentId=${pixData.paymentId}`);
        const data = await res.json();

        if (data?.confirmed) {
          paymentCompletedRef.current = true;
          setPollingActive(false);
          setActivationRecipientEmail(data.email || email);
          setEmailActivationSent(true);
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

  // Helper de validação da Etapa 1: Dados de Cadastro
  const isStep1Complete = (): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');
    return Boolean(
      name.trim().length >= 3 &&
      email.trim().includes('@') &&
      cleanCpf.length === 11 &&
      cleanPhone.length >= 10 &&
      birthDate.trim().length === 10 &&
      profession
    );
  };

  // Helper de validação da Etapa 2: Endereço
  const isStep2Complete = (): boolean => {
    const cleanCep = cep.replace(/\D/g, '');
    return Boolean(
      cleanCep.length === 8 &&
      street.trim() &&
      number.trim() &&
      neighborhood.trim() &&
      city.trim() &&
      state.trim()
    );
  };

  // Avançar para a Etapa 2 com validação
  const handleAdvanceToAddress = () => {
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido.');
      return;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      setErrorMessage('Por favor, informe um CPF válido de 11 dígitos.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor, informe um número de telefone com DDD.');
      return;
    }
    if (birthDate.trim().length !== 10) {
      setErrorMessage('Por favor, informe sua data de nascimento completa.');
      return;
    }
    if (!profession) {
      setErrorMessage('Por favor, selecione sua profissão ou área de atuação.');
      return;
    }
    setActiveStep(2);
  };

  // Avançar para a Etapa 3 com validação
  const handleAdvanceToPayment = () => {
    setErrorMessage(null);
    if (!handleAdvanceToAddressValidationOnly()) return;
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrorMessage('Por favor, informe um CEP válido.');
      return;
    }
    if (!street.trim() || !number.trim()) {
      setErrorMessage('Por favor, preencha o logradouro e número.');
      return;
    }
    if (!neighborhood.trim() || !city.trim() || !state.trim()) {
      setErrorMessage('Por favor, preencha bairro, cidade e estado.');
      return;
    }
    setActiveStep(3);
  };

  const handleAdvanceToAddressValidationOnly = (): boolean => {
    if (!name.trim() || !email.trim() || cpf.replace(/\D/g, '').length !== 11 || phone.replace(/\D/g, '').length < 10 || birthDate.trim().length !== 10 || !profession) {
      setActiveStep(1);
      setErrorMessage('Por favor, complete seus dados de cadastro primeiro.');
      return false;
    }
    return true;
  };

  // Submit Handler
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validações dos dados de cadastro
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido para acesso.');
      return;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      setErrorMessage('Por favor, informe um CPF válido.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor, informe um telefone com DDD.');
      return;
    }
    if (!birthDate || birthDate.length !== 10) {
      setErrorMessage('Por favor, informe sua data de nascimento (DD/MM/AAAA).');
      return;
    }
    const calculatedAge = calculateAge(birthDate);
    if (calculatedAge === null || calculatedAge < 12) {
      setErrorMessage('Por favor, informe uma data de nascimento válida.');
      return;
    }
    if (!profession) {
      setErrorMessage('Por favor, selecione sua profissão ou área de atuação em Escolher.');
      return;
    }

    if (!paymentMethod) {
      setErrorMessage('Selecione uma forma de pagamento (Cartão de Crédito ou Pix).');
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage('Você precisa ler e aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    // Se escolheu dados diferentes para pagamento, validar dados do pagador
    if (billingMode === 'different') {
      if (!payerName.trim() || !payerCpf.trim() || !payerEmail.trim()) {
        setErrorMessage('Por favor, preencha o Nome, CPF e E-mail do titular de pagamento.');
        return;
      }
    }

    setLoading(true);

    try {
      const studentAddress = {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        postalCode: cep
      };

      const billingInfo = billingMode === 'different' ? {
        name: payerName.trim(),
        cpfCnpj: payerCpf.replace(/\D/g, ''),
        email: payerEmail.trim(),
        phone: payerPhone.replace(/\D/g, '') || phone.replace(/\D/g, ''),
        address: {
          street: payerStreet || street,
          number: payerNumber || number,
          complement: payerComplement || complement,
          neighborhood: payerNeighborhood || neighborhood,
          city: payerCity || city,
          state: payerState || state,
          postalCode: payerCep || cep
        }
      } : undefined;

      let attr: any = null;
      try {
        const stored = localStorage.getItem('flmmkr_traffic_attribution');
        if (stored) attr = JSON.parse(stored);
      } catch {}

      if (paymentMethod === 'PIX') {
        const res = await fetch('/api/checkout/asaas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            cpfCnpj: cpf.replace(/\D/g, ''),
            phone: phone.replace(/\D/g, ''),
            birthDate: birthDate.trim(),
            age: calculatedAge,
            profession,
            address: studentAddress,
            billingType: 'PIX',
            billingInfo,
            macAddress,
            isExpired,
            hasDiscount25,
            trafficSource: attr?.sourceName,
            utmSource: attr?.utmSource,
            referrer: attr?.referrer
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error || 'Erro ao gerar cobrança Pix no Asaas.');
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
            name: name.trim(),
            email: email.trim(),
            cpfCnpj: cpf.replace(/\D/g, ''),
            phone: phone.replace(/\D/g, ''),
            birthDate: birthDate.trim(),
            age: calculatedAge,
            profession,
            address: studentAddress,
            billingType: 'CREDIT_CARD',
            installments,
            creditCard: {
              holderName: cardHolder.toUpperCase(),
              number: cardNumber.replace(/\s/g, ''),
              expiryMonth: expMonth,
              expiryYear: fullYear,
              ccv: cardCvv
            },
            billingInfo,
            macAddress,
            isExpired,
            hasDiscount25,
            trafficSource: attr?.sourceName,
            utmSource: attr?.utmSource,
            referrer: attr?.referrer
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error || 'Pagamento recusado pela operadora do cartão.');
        }

        paymentCompletedRef.current = true;
        setActivationRecipientEmail(data.email || email);
        setEmailActivationSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !visible) return null;

  const currentPrice = isExpired ? regularPrice : price;

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
          background: 'rgba(20,20,24,0.96)',
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
          {/* Header - Apple Typography */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold tracking-[0.06em] text-[#0071e3] uppercase">
                FLMMKR • CHECKOUT OFICIAL
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Ambiente Seguro Asaas
              </span>
            </div>
            <h2 className="text-[21px] sm:text-[24px] font-semibold text-white tracking-[-0.016em] sm:tracking-[-0.019em] leading-[1.18]">
              Masterclass Color Master | Produto
            </h2>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight leading-none">
                R$ {currentPrice}
              </span>
              {!isExpired && (
                <span className="text-[13px] text-[#86868b] line-through leading-none">
                  De R$ {regularPrice}
                </span>
              )}
              <span className="text-[12px] text-[#2997ff] font-medium ml-1">
                12 Meses de acesso + atualizações
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-[13px] text-red-200 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Não foi possível concluir</p>
                <p className="text-[12px] text-red-200/90 mt-0.5 leading-[1.4]">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* 1. DADOS DE CADASTRO */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-500 ease-in-out">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                      isStep1Complete()
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : activeStep === 1
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isStep1Complete() && activeStep !== 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </span>
                  <div>
                    <h3 className="text-[13px] sm:text-[14px] font-semibold text-white tracking-[-0.01em]">
                      Dados de Cadastro
                    </h3>
                    {activeStep !== 1 && name && (
                      <p className="text-[11px] text-white/50 truncate max-w-xs">
                        {name} · {email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeStep !== 1 && isStep1Complete() && (
                    <span className="text-[11px] text-[#2997ff] flex items-center gap-1 font-medium">
                      <Edit2 className="w-3 h-3" /> Editar
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 transition-transform duration-500 ease-in-out ${
                      activeStep === 1 ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Conteúdo Expansível Etapa 1 */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  activeStep === 1 ? 'max-h-[800px] opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 p-0 pointer-events-none'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)'
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      E-mail (para login e acesso) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      CPF (para emissão da NF) *
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      WhatsApp / Telefone *
                    </label>
                    <PhoneInputWithDdi
                      required
                      value={phone}
                      onChange={setPhone}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Data de Nascimento *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Qual a sua profissão ou área de atuação? *
                    </label>
                    <select
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full h-[44px] px-3.5 rounded-xl bg-[#1d1d24] border border-white/12 text-white text-[14px] focus:outline-none focus:border-[#0071e3] transition-all cursor-pointer"
                    >
                      <option value="" disabled>
                        Escolher
                      </option>
                      {PROFESSIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ENDEREÇO */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-500 ease-in-out">
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) {
                    handleAdvanceToAddress();
                  } else {
                    setActiveStep(2);
                  }
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                      isStep2Complete()
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : activeStep === 2
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isStep2Complete() && activeStep !== 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                  </span>
                  <div>
                    <h3 className="text-[13px] sm:text-[14px] font-semibold text-white tracking-[-0.01em]">
                      Endereço
                    </h3>
                    {activeStep !== 2 && cep && street && (
                      <p className="text-[11px] text-white/50 truncate max-w-xs">
                        {street}, {number} · {city}/{state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {loadingCep && (
                    <span className="text-[11px] text-[#2997ff] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Buscando CEP...
                    </span>
                  )}
                  {activeStep !== 2 && isStep2Complete() && (
                    <span className="text-[11px] text-[#2997ff] flex items-center gap-1 font-medium">
                      <Edit2 className="w-3 h-3" /> Editar
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 transition-transform duration-500 ease-in-out ${
                      activeStep === 2 ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Conteúdo Expansível Etapa 2 */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  activeStep === 2 ? 'max-h-[800px] opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 p-0 pointer-events-none'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)'
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      CEP *
                    </label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Rua / Logradouro *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Nome da sua rua ou avenida"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto / Bloco"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Bairro"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cidade"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 tracking-[-0.01em]">
                      Estado (UF) *
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="SP"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FORMA DE PAGAMENTO */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-500 ease-in-out">
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) {
                    handleAdvanceToAddress();
                  } else if (activeStep === 2) {
                    handleAdvanceToPayment();
                  } else {
                    setActiveStep(3);
                  }
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                      activeStep === 3
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    3
                  </span>
                  <div>
                    <h3 className="text-[13px] sm:text-[14px] font-semibold text-white tracking-[-0.01em]">
                      Método de Pagamento
                    </h3>
                    {activeStep !== 3 && paymentMethod && (
                      <p className="text-[11px] text-white/50">
                        {paymentMethod === 'PIX' ? 'Pix (Instantâneo)' : 'Cartão de Crédito'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 transition-transform duration-500 ease-in-out ${
                      activeStep === 3 ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Conteúdo Expansível Etapa 3 */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  activeStep === 3 ? 'max-h-[1400px] opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 p-0 pointer-events-none'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)'
                }}
              >
                <div className="pt-2 border-t border-white/5">

              {/* Selector Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CREDIT_CARD');
                    setPixData(null);
                    setPollingActive(false);
                  }}
                  className={`h-[48px] px-4 rounded-2xl border text-[14px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-[0_4px_16px_rgba(0,113,227,0.4)]'
                      : 'bg-white/[0.06] border-white/10 text-white/80 hover:bg-white/10'
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
                  className={`h-[48px] px-4 rounded-2xl border text-[14px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'PIX'
                      ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-[0_4px_16px_rgba(0,113,227,0.4)]'
                      : 'bg-white/[0.06] border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Pix (Instantâneo)
                </button>
              </div>

              {/* SWITCH / TOGGLE: USAR DADOS DO CADASTRO OU DADOS DIFERENTES */}
              {paymentMethod && (
                <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                  <span className="text-[12px] font-medium text-white/70 block mb-2">
                    Dados do Titular de Pagamento / Cobrança:
                  </span>
                  
                  {/* Segmented Switch (Apple Style) */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setBillingMode('same')}
                      className={`py-2 px-3 rounded-lg text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        billingMode === 'same'
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Usar dados do cadastro
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingMode('different')}
                      className={`py-2 px-3 rounded-lg text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        billingMode === 'different'
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Dados diferentes do cadastro
                    </button>
                  </div>

                  {/* CAMPOS DE COBRANÇA DIFERENTES DO CADASTRO (EXPANSÍVEL) */}
                  {billingMode === 'different' && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                      <div className="text-[12px] text-[#2997ff] font-medium flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4" />
                        Informe os dados do pagador (quem irá pagar com cartão ou Pix):
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            Nome Completo do Titular / Pagador *
                          </label>
                          <input
                            type="text"
                            required
                            value={payerName}
                            onChange={(e) => setPayerName(e.target.value)}
                            placeholder="Nome impresso no cartão ou pagador do Pix"
                            className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            CPF do Titular / Pagador *
                          </label>
                          <input
                            type="text"
                            required
                            value={payerCpf}
                            onChange={(e) => setPayerCpf(formatCpf(e.target.value))}
                            placeholder="000.000.000-00"
                            className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            E-mail do Titular *
                          </label>
                          <input
                            type="email"
                            required
                            value={payerEmail}
                            onChange={(e) => setPayerEmail(e.target.value)}
                            placeholder="email@titular.com"
                            className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            WhatsApp / Telefone do Titular
                          </label>
                          <PhoneInputWithDdi
                            value={payerPhone}
                            onChange={setPayerPhone}
                            placeholder="(00) 00000-0000"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5 flex items-center justify-between">
                            <span>CEP de Cobrança</span>
                            {loadingPayerCep && <Loader2 className="w-3 h-3 animate-spin text-[#2997ff]" />}
                          </label>
                          <input
                            type="text"
                            value={payerCep}
                            onChange={(e) => handlePayerCepChange(e.target.value)}
                            placeholder="00000-000"
                            className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            Rua / Endereço de Cobrança
                          </label>
                          <input
                            type="text"
                            value={payerStreet}
                            onChange={(e) => setPayerStreet(e.target.value)}
                            placeholder="Rua / Avenida"
                            className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            Número
                          </label>
                          <input
                            type="text"
                            value={payerNumber}
                            onChange={(e) => setPayerNumber(e.target.value)}
                            placeholder="123"
                            className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                            Cidade / UF
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={payerCity}
                              onChange={(e) => setPayerCity(e.target.value)}
                              placeholder="Cidade"
                              className="w-3/4 h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all"
                            />
                            <input
                              type="text"
                              maxLength={2}
                              value={payerState}
                              onChange={(e) => setPayerState(e.target.value.toUpperCase())}
                              placeholder="UF"
                              className="w-1/4 h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SE CARTÃO DE CRÉDITO SELECIONADO */}
              {paymentMethod === 'CREDIT_CARD' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[13px] font-semibold text-white/90">
                      Dados do Cartão de Crédito
                    </span>
                    <span className="text-[11px] text-white/40">
                      Criptografia de ponta a ponta
                    </span>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                      Número do Cartão *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                      Nome impresso no Cartão *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                        Validade (MM/AA) *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                        CVV (Código de segurança) *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full h-[44px] px-3.5 rounded-xl bg-white/[0.06] border border-white/12 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-[#0071e3] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-white/70 mb-1 ml-0.5">
                      Parcelamento
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full h-[44px] px-3.5 rounded-xl bg-[#1d1d24] border border-white/12 text-white text-[14px] focus:outline-none focus:border-[#0071e3] transition-all cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                        const installmentValue = getAsaasInstallmentValue(currentPrice, num);
                        return (
                          <option key={num} value={num}>
                            {num === 1
                              ? `1x de R$ ${installmentValue} à vista`
                              : `${num}x de R$ ${installmentValue}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* CHECKBOX DE TERMOS DE USO E POLÍTICA DE PRIVACIDADE */}
              <div className="pt-2 pb-1">
                <label className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#0071e3] focus:ring-[#0071e3] focus:ring-offset-0 bg-white/10 cursor-pointer shrink-0"
                  />
                  <span className="text-[12px] sm:text-[13px] text-white/80 leading-snug">
                    Li e aceito os{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-[#2997ff] hover:text-[#0071e3] underline underline-offset-2 font-medium cursor-pointer"
                    >
                      Termos de Uso e a Política de Privacidade
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* SE PIX SELECIONADO */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/10 animate-in fade-in duration-200 text-center">
                  {!pixData ? (
                    <div className="py-4">
                      <p className="text-[13px] text-white/70 mb-3 leading-[1.4]">
                        Clique no botão abaixo para gerar seu QR Code Pix oficial do Asaas com liberação imediata.
                      </p>
                      <button
                        type="submit"
                        disabled={loading}
                        className="h-[46px] px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-[#0071e3]/30"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Gerar QR Code Pix (R$ {currentPrice})
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

                      <div className="flex items-center justify-center gap-2 text-[12px] text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Aguardando pagamento... redirecionamento automático
                      </div>

                      {/* Pix Copia e Cola */}
                      <div className="relative max-w-sm mx-auto">
                        <input
                          type="text"
                          readOnly
                          value={pixData.payload}
                          className="w-full pr-24 pl-3.5 h-[42px] rounded-xl bg-white/10 border border-white/15 text-[12px] text-white/90 font-mono truncate"
                        />
                        <button
                          type="button"
                          onClick={copyPixCode}
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {pixCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>

                      <p className="text-[12px] text-white/50 leading-relaxed">
                        Abra o app do seu banco, escolha Pix &gt; Pagar com QR Code ou Copia e Cola.
                      </p>
                    </div>
                  )}
                </div>
              )}
                  </div>
                </div>
              </div>

            {/* Bottom Final Submit for Credit Card */}
            {paymentMethod === 'CREDIT_CARD' && (
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white font-semibold text-[15px] transition-all shadow-[0_4px_24px_rgba(0,113,227,0.4)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {installments > 1
                      ? `Pagar ${installments}x de R$ ${getAsaasInstallmentValue(currentPrice, installments)} com Cartão`
                      : `Pagar R$ ${currentPrice.toFixed(2).replace('.', ',')} à vista com Cartão`}
                  </>
                )}
              </button>
            )}

            <div className="pt-1 text-center">
              <span className="text-[12px] text-[#86868b] flex items-center justify-center gap-1.5 leading-[1.33337]">
                <Lock className="w-3 h-3" /> Seus dados de pagamento são criptografados e enviados diretamente ao Asaas.
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Autocontido de Termos de Uso e Política de Privacidade */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => setAcceptedTerms(true)}
      />

      {/* Modal de Liberação de Acesso via E-mail */}
      {emailActivationSent && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121318] border border-white/15 rounded-2xl max-w-md w-full p-7 sm:p-8 text-center shadow-2xl relative">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Mail className="w-8 h-8" />
            </div>

            <span className="text-[11px] uppercase tracking-widest font-mono text-zinc-400">
              FLMMKR • COLOR MASTER®
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 mb-3 tracking-tight">
              Pagamento Confirmado!
            </h3>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Para a sua segurança, seu acesso precisa ser liberado através do link que acabamos de enviar para o seu e-mail:
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5 font-mono text-xs sm:text-sm text-white break-all select-all font-semibold">
              {activationRecipientEmail || email}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Abra sua caixa de entrada e clique no link de ativação para cadastrar sua senha exclusiva e entrar na Área do Aluno. Se não localizar em instantes, confira sua pasta de spam.
            </p>

            <button
              type="button"
              onClick={() => {
                setEmailActivationSent(false);
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
            >
              Entendi, vou acessar meu e-mail
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
