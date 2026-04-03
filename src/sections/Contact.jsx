import Input from '../components/ui/Input'

export default function Contact({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <Input
        label="Phone Number"
        required
        type="tel"
        placeholder="+91 99999 99999"
        value={data.contactPhone || ''}
        onChange={(e) => onChange({ contactPhone: e.target.value })}
        error={errors?.contactPhone}
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
        onChange={(e) => onChange({ website: e.target.value })}
        error={errors?.website}
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
