import { useState } from 'react'
import Input from '../components/ui/Input'

function isValidUrl(val) {
  try {
    const url = new URL(val)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch { return false }
}

export default function Contact({ data, onChange, errors }) {
  const [phoneError, setPhoneError] = useState('')
  const [websiteError, setWebsiteError] = useState('')

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
    onChange({ contactPhone: digits })
    if (phoneError) setPhoneError('')
  }

  function handlePhoneBlur() {
    const val = data.contactPhone || ''
    if (val && val.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits')
    } else {
      setPhoneError('')
    }
  }

  function handleWebsiteChange(e) {
    onChange({ website: e.target.value })
    if (websiteError) setWebsiteError('')
  }

  function handleWebsiteBlur() {
    const val = data.website || ''
    if (val && !isValidUrl(val)) {
      setWebsiteError('Must be a valid URL starting with https://')
    } else {
      setWebsiteError('')
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Phone Number"
        required
        type="tel"
        placeholder="9999999999"
        value={data.contactPhone || ''}
        onChange={handlePhoneChange}
        onBlur={handlePhoneBlur}
        error={errors?.contactPhone || phoneError}
        hint="10-digit mobile number"
      />

      <Input
        label="Email Address"
        required
        type="email"
        placeholder="hello@hotel.com"
        value={data.contactEmail || ''}
        onChange={(e) => onChange({ contactEmail: e.target.value })}
        error={errors?.contactEmail}
      />

      <Input
        label="Website URL"
        type="url"
        placeholder="https://www.hotel.com"
        value={data.website || ''}
        onChange={handleWebsiteChange}
        onBlur={handleWebsiteBlur}
        error={errors?.website || websiteError}
      />

      <Input
        label="Social Media Links"
        placeholder="Instagram, Facebook, Twitter (comma separated)"
        value={data.socialLinks || ''}
        onChange={(e) => onChange({ socialLinks: e.target.value })}
        hint="e.g. https://instagram.com/hotel, https://facebook.com/hotel"
      />
    </div>
  )
}
