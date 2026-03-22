import { useState, useEffect } from 'react'

const PackSimulator = () => {
  const [sets, setSets] = useState([])
  const [selectedSet, setSelectedSet] = useState('')
  const [loading, setLoading] = useState(false)
  const [pack, setPack] = useState([])
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    fetchSets()
  }, [])

  const fetchSets = async () => {
    try {
      const response = await fetch('https://api.pokemontcg.io/v2/sets')
      const data = await response.json()
      setSets(data.data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)))
    } catch (error) {
      console.error('Error fetching sets:', error)
      alert('Failed to load sets')
    }
  }

  const getRarityWeight = (rarity) => {
    const r = rarity?.toLowerCase() || ''
    if (r.includes('secret')) return 0.1
    if (r.includes('ultra') || r.includes('rainbow') || r.includes('full art')) return 0.4
    if (r.includes('rare holo')) return 2.5
    if (r.includes('rare')) return 7
    if (r.includes('uncommon')) return 20
    return 70 // common
  }

  const selectRandomCard = (cards, weights) => {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < cards.length; i++) {
      random -= weights[i]
      if (random <= 0) return cards[i]
    }
    return cards[cards.length - 1]
  }

  const openPack = async () => {
    if (!selectedSet) {
      alert('Please select a set first')
      return
    }

    setLoading(true)
    setPack([])

    try {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${selectedSet}&pageSize=250`)
      const data = await response.json()

      if (data.data.length === 0) {
        alert('No cards found in this set')
        setLoading(false)
        return
      }

      const weights = data.data.map(card => getRarityWeight(card.rarity))
      const packCards = []

      // Pick 10 random cards weighted by rarity
      for (let i = 0; i < 10; i++) {
        const card = selectRandomCard(data.data, weights)
        packCards.push(card)
      }

      // Calculate total value
      const value = packCards.reduce((sum, card) => {
        const price = card.tcgplayer?.prices?.holofoil?.market ||
                     card.tcgplayer?.prices?.normal?.market ||
                     card.tcgplayer?.prices?.['1stEditionHolofoil']?.market ||
                     0
        return sum + price
      }, 0)

      setPack(packCards)
      setTotalValue(value)
    } catch (error) {
      console.error('Error opening pack:', error)
      alert('Failed to open pack')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🎴 Pack Simulator</h2>

      {/* Set Selection */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Select a Set
        </label>
        <select
          value={selectedSet}
          onChange={(e) => setSelectedSet(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
        >
          <option value="">Choose a set...</option>
          {sets.map(set => (
            <option key={set.id} value={set.id}>
              {set.name} ({set.series}) - {set.releaseDate}
            </option>
          ))}
        </select>
      </div>

      {/* Open Pack Button */}
      <button
        onClick={openPack}
        disabled={loading || !selectedSet}
        className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:bg-red-700 transition-all disabled:bg-gray-400 mb-8"
      >
        {loading ? 'Opening Pack...' : pack.length > 0 ? '🎴 Open Another Pack' : '🎴 Open Pack'}
      </button>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="spinner"></div>
        </div>
      )}

      {/* Pack Results */}
      {pack.length > 0 && !loading && (
        <div>
          {/* Total Value */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded">
            <h3 className="font-bold text-xl mb-2 text-gray-800">📊 Pack Value</h3>
            <p className="text-3xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">Total market value of cards in this pack</p>
          </div>

          {/* Card Grid */}
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Cards</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pack.map((card, idx) => {
              const price = card.tcgplayer?.prices?.holofoil?.market ||
                           card.tcgplayer?.prices?.normal?.market ||
                           card.tcgplayer?.prices?.['1stEditionHolofoil']?.market ||
                           0

              return (
                <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden card-hover">
                  <img
                    src={card.images.small}
                    alt={card.name}
                    className="w-full h-48 object-contain bg-gray-100 p-2"
                  />
                  <div className="p-3">
                    <h4 className="font-bold text-sm mb-1">{card.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{card.rarity}</p>
                    {price > 0 ? (
                      <p className="text-lg font-bold text-green-600">${price.toFixed(2)}</p>
                    ) : (
                      <p className="text-xs text-gray-400">No price data</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && pack.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            Select a set and click "Open Pack" to simulate opening a booster pack!
          </p>
        </div>
      )}
    </div>
  )
}

export default PackSimulator
