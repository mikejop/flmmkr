'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryDdi {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: (digits: string) => string;
}

export const COUNTRIES: CountryDdi[] = [
  {
    code: 'BR',
    name: 'Brasil',
    dialCode: '+55',
    flag: '🇧🇷',
    format: (d: string) => {
      const v = d.slice(0, 11);
      if (v.length > 10) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
      if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
      return v;
    }
  },
  {
    code: 'PT',
    name: 'Portugal',
    dialCode: '+351',
    flag: '🇵🇹',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 6) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
      if (v.length > 3) return `${v.slice(0, 3)} ${v.slice(3)}`;
      return v;
    }
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    dialCode: '+1',
    flag: '🇺🇸',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 6) return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6)}`;
      if (v.length > 3) return `(${v.slice(0, 3)}) ${v.slice(3)}`;
      return v;
    }
  },
  {
    code: 'ES',
    name: 'Espanha',
    dialCode: '+34',
    flag: '🇪🇸',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 5) return `${v.slice(0, 3)} ${v.slice(3, 5)} ${v.slice(5, 7)} ${v.slice(7)}`;
      if (v.length > 3) return `${v.slice(0, 3)} ${v.slice(3)}`;
      return v;
    }
  },
  {
    code: 'GB',
    name: 'Reino Unido',
    dialCode: '+44',
    flag: '🇬🇧',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 5) return `${v.slice(0, 4)} ${v.slice(4)}`;
      return v;
    }
  },
  {
    code: 'CA',
    name: 'Canadá',
    dialCode: '+1',
    flag: '🇨🇦',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 6) return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6)}`;
      if (v.length > 3) return `(${v.slice(0, 3)}) ${v.slice(3)}`;
      return v;
    }
  },
  {
    code: 'AO',
    name: 'Angola',
    dialCode: '+244',
    flag: '🇦🇴',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 6) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
      if (v.length > 3) return `${v.slice(0, 3)} ${v.slice(3)}`;
      return v;
    }
  },
  {
    code: 'MZ',
    name: 'Moçambique',
    dialCode: '+258',
    flag: '🇲🇿',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 5) return `${v.slice(0, 2)} ${v.slice(2, 5)} ${v.slice(5)}`;
      if (v.length > 2) return `${v.slice(0, 2)} ${v.slice(2)}`;
      return v;
    }
  },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '+54',
    flag: '🇦🇷',
    format: (d: string) => {
      const v = d.slice(0, 11);
      if (v.length > 6) return `${v.slice(0, 2)} ${v.slice(2, 6)}-${v.slice(6)}`;
      return v;
    }
  },
  {
    code: 'CL',
    name: 'Chile',
    dialCode: '+56',
    flag: '🇨🇱',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 4) return `${v.slice(0, 1)} ${v.slice(1, 5)} ${v.slice(5)}`;
      return v;
    }
  },
  {
    code: 'CO',
    name: 'Colômbia',
    dialCode: '+57',
    flag: '🇨🇴',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 6) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
      return v;
    }
  },
  {
    code: 'MX',
    name: 'México',
    dialCode: '+52',
    flag: '🇲🇽',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 6) return `${v.slice(0, 2)} ${v.slice(2, 6)} ${v.slice(6)}`;
      return v;
    }
  },
  {
    code: 'UY',
    name: 'Uruguai',
    dialCode: '+598',
    flag: '🇺🇾',
    format: (d: string) => {
      const v = d.slice(0, 8);
      if (v.length > 4) return `${v.slice(0, 4)} ${v.slice(4)}`;
      return v;
    }
  },
  {
    code: 'PY',
    name: 'Paraguai',
    dialCode: '+595',
    flag: '🇵🇾',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 6) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
      return v;
    }
  },
  {
    code: 'FR',
    name: 'França',
    dialCode: '+33',
    flag: '🇫🇷',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 6) return `${v.slice(0, 1)} ${v.slice(1, 3)} ${v.slice(3, 5)} ${v.slice(5, 7)} ${v.slice(7)}`;
      return v;
    }
  },
  {
    code: 'DE',
    name: 'Alemanha',
    dialCode: '+49',
    flag: '🇩🇪',
    format: (d: string) => {
      const v = d.slice(0, 11);
      if (v.length > 7) return `${v.slice(0, 4)} ${v.slice(4, 7)} ${v.slice(7)}`;
      return v;
    }
  },
  {
    code: 'IT',
    name: 'Itália',
    dialCode: '+39',
    flag: '🇮🇹',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 6) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
      return v;
    }
  },
  {
    code: 'IE',
    name: 'Irlanda',
    dialCode: '+353',
    flag: '🇮🇪',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 5) return `${v.slice(0, 2)} ${v.slice(2, 5)} ${v.slice(5)}`;
      return v;
    }
  },
  {
    code: 'CH',
    name: 'Suíça',
    dialCode: '+41',
    flag: '🇨🇭',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 5) return `${v.slice(0, 2)} ${v.slice(2, 5)} ${v.slice(5)}`;
      return v;
    }
  },
  {
    code: 'AU',
    name: 'Austrália',
    dialCode: '+61',
    flag: '🇦🇺',
    format: (d: string) => {
      const v = d.slice(0, 9);
      if (v.length > 6) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
      return v;
    }
  },
  {
    code: 'JP',
    name: 'Japão',
    dialCode: '+81',
    flag: '🇯🇵',
    format: (d: string) => {
      const v = d.slice(0, 10);
      if (v.length > 6) return `${v.slice(0, 2)} ${v.slice(2, 6)} ${v.slice(6)}`;
      return v;
    }
  },
];

interface PhoneInputWithDdiProps {
  value: string;
  onChange: (fullValue: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  id?: string;
  autoFocus?: boolean;
}

/**
 * Parses raw input into matching country + national digits
 */
function parseRawPhone(raw: string): { country: CountryDdi; localDigits: string } {
  if (!raw) return { country: COUNTRIES[0], localDigits: '' };

  const clean = raw.trim();

  // If starts with +, try to match country dial code
  if (clean.startsWith('+')) {
    // Sort by longest dial code first (e.g. +351 before +3)
    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (clean.startsWith(c.dialCode)) {
        const remaining = clean.slice(c.dialCode.length).replace(/\D/g, '');
        return { country: c, localDigits: remaining };
      }
    }
  }

  // Fallback: digits only
  const digits = clean.replace(/\D/g, '');
  
  // If starts with 55 and length > 11, could be 55 + national number
  if (digits.startsWith('55') && digits.length >= 12) {
    return { country: COUNTRIES[0], localDigits: digits.slice(2) };
  }

  return { country: COUNTRIES[0], localDigits: digits };
}

export const PhoneInputWithDdi: React.FC<PhoneInputWithDdiProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  containerClassName = '',
  id,
  autoFocus = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryDdi>(COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    const { country, localDigits } = parseRawPhone(value || '');
    setSelectedCountry(country);
    setLocalNumber(country.format(localDigits));
  }, [value]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCountrySelect = (c: CountryDdi) => {
    setSelectedCountry(c);
    setIsOpen(false);
    setSearch('');
    const rawDigits = localNumber.replace(/\D/g, '');
    const formatted = c.format(rawDigits);
    setLocalNumber(formatted);
    onChange(`${c.dialCode} ${formatted}`.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    const formatted = selectedCountry.format(rawDigits);
    setLocalNumber(formatted);

    if (!rawDigits) {
      onChange('');
    } else {
      onChange(`${selectedCountry.dialCode} ${formatted}`.trim());
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`relative flex items-stretch w-full h-[44px] rounded-xl bg-white/[0.06] border border-white/12 transition-all focus-within:border-[#0071e3] overflow-hidden ${containerClassName}`}
      ref={dropdownRef}
    >
      {/* DDI Picker Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full px-3 flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold cursor-pointer shrink-0 transition-all select-none focus:outline-none border-r border-white/10"
        title={`Alterar país: ${selectedCountry.name} (${selectedCountry.dialCode})`}
      >
        <span className="text-sm leading-none">{selectedCountry.flag}</span>
        <span className="font-mono text-[12px] text-white/80">{selectedCountry.dialCode}</span>
        <ChevronDown size={12} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Phone Number Input */}
      <input
        type="tel"
        id={id}
        autoFocus={autoFocus}
        required={required}
        value={localNumber}
        onChange={handleInputChange}
        placeholder={placeholder || selectedCountry.format('99999999999')}
        className={`flex-1 min-w-0 h-full bg-transparent px-3 text-[14px] text-white placeholder-white/25 focus:outline-none border-0 ${className}`}
      />

      {/* DDI Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-[#1c1c1f] border border-white/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Search Header */}
          <div className="p-2 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10">
              <Search size={12} className="text-neutral-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país ou código..."
                className="w-full bg-transparent text-xs text-white placeholder-neutral-400 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <p className="p-3 text-center text-[11px] text-neutral-400">Nenhum país encontrado</p>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#0071e3] text-white font-semibold'
                        : 'text-neutral-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-mono text-[11px] ${isSelected ? 'text-white/90' : 'text-neutral-400'}`}>
                        {c.dialCode}
                      </span>
                      {isSelected && <Check size={13} className="text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
