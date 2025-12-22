'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CountryCode {
  code: string
  country: string
  flag: string
}

const countryCodes: CountryCode[] = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  // GCC Countries
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  // Other Countries
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
]

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  id?: string
}

export function PhoneInput({
  value = '',
  onChange,
  onBlur,
  className = '',
  placeholder = '',
  required = false,
  disabled = false,
  error,
  id,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Parse initial value if provided
  useEffect(() => {
    if (value && !isInitialized) {
      // Try to extract country code from value
      const found = countryCodes.find(code => value.startsWith(code.code))
      if (found) {
        setCountryCode(found.code)
        setPhoneNumber(value.substring(found.code.length))
      } else if (value.startsWith('+')) {
        // Has + but no matching code, extract first few digits
        const match = value.match(/^\+(\d{1,3})(.*)$/)
        if (match) {
          // Try to find matching code
          const codeMatch = countryCodes.find(c => value.startsWith(c.code))
          if (codeMatch) {
            setCountryCode(codeMatch.code)
            setPhoneNumber(value.substring(codeMatch.code.length))
          } else {
            setCountryCode('+91')
            setPhoneNumber(value.substring(1))
          }
        } else {
          setCountryCode('+91')
          setPhoneNumber(value.substring(1))
        }
      } else {
        // No + prefix, assume India
        setCountryCode('+91')
        setPhoneNumber(value)
      }
      setIsInitialized(true)
    } else if (!value && !isInitialized) {
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  // Combine country code and phone number
  useEffect(() => {
    if (isInitialized) {
      // Only call onChange if phone number has digits
      if (phoneNumber.trim().length > 0) {
        const fullNumber = countryCode + phoneNumber
        if (onChange && fullNumber !== value) {
          onChange(fullNumber)
        }
      } else if (value && onChange) {
        // Clear the value if phone number is empty
        onChange('')
      }
    }
  }, [countryCode, phoneNumber, onChange, isInitialized, value])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target.value.replace(/\D/g, '') // Only digits
    setPhoneNumber(input)
  }

  const handleCountryChange = (newCode: string): void => {
    setCountryCode(newCode)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={countryCode}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              {countryCodes.find(c => c.code === countryCode) && (
                <span className="flex items-center gap-1">
                  <span>{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                  <span>{countryCode}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                  <span className="text-xs text-muted-foreground">{country.country}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`flex-1 ${error ? 'border-red-500' : ''} ${className}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

