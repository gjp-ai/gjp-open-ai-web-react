import type { ChangeEvent } from 'react'
import { useUIContext } from '../contexts/UIContext'
import { useT } from '../i18n'

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useUIContext()
  const t = useT()
  const placeholder = t('search.placeholder')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  return (
    <input
      className="search-input"
      type="search"
      value={searchQuery}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  )
}
