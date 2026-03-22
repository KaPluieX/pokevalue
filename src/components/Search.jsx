import { useState, useEffect } from 'react'

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [priceAlerts, setPriceAlerts] = useState([])
  const [alertBanner, setAlertBanner] = useState([])

  useEffect(() => {
    loadPriceAlerts()
  }, [])

  const loadPriceAlerts = () => {
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
    setPriceAlerts(alerts)
    checkPriceAlerts(alerts)
  }

  const checkPriceAlerts = async (alerts) => {
    const triggered = []
    for (const alert of alerts) {
      try {
        const response = await fetch(`https://api.pokemontcg.io/v2/cards/${alert.cardId}`)
        const data = await response.json()
        const currentPrice = data.data.tcgplayer?.prices?.holofoil?.market ||
                           data.data.tcgplayer?.prices?.normal?.market ||
                           0
        if (currentPrice > 0 && currentPrice <= alert.targetPrice) {
          triggered.push({ ...alert, currentPrice, cardName: data.data.name })
        }
      } catch (error) {
        console.error('Error checking alert:', error)
      }
    }
    setAlertBanner(triggered)
  }

  const calculatePSAScore = (card) => {
    const setName = card.set?.name?.toLowerCase() || ''
    const rarity = card.rarity?.toLowerCase() || ''
    const cardName = card.name?.toLowerCase() || ''

    let psaScore = 5 // base score

    // Vintage sets
    if (setName.includes('base set') || setName.includes('jungle') || setName.includes('fossil')) {
      psaScore = 7
    }

    // High-end rarities
    if (rarity.includes('secret rare') || rarity.includes('special illustration rare')) {
      psaScore = 8
    }

    // Popular characters
    const popularChars = ['charizard', 'pikachu', 'mewtwo', 'eevee', 'gengar']
    if (popularChars.some(char => cardName.includes(char))) {
      psaScore += 1
    }

    // Price-based bonus
    const price = card.tcgplayer?.prices?.holofoil?.market ||
                  card.tcgplayer?.prices?.normal?.market ||
                  0
    if (price > 50) {
      psaScore += 1
    }

    return Math.min(10, psaScore)
  }

  const getPSAColor = (score) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateInvestmentScore = (card) => {
    let score = 0
    const rarity = card.rarity?.toLowerCase() || ''

    // Base score from rarity
    if (rarity.includes('secret') || rarity.includes('special illustration')) {
      score = 5
    } else if (rarity.includes('ultra') || rarity.includes('full art') || rarity.includes('rainbow')) {
      score = 4
    } else if (rarity.includes('rare holo')) {
      score = 3
    } else if (rarity === 'uncommon') {
      score = 2
    } else {
      score = 1
    }

    // Bonuses (cap at 5)
    const popularChars = ['charizard', 'pikachu', 'mewtwo', 'eevee', 'gengar']
    const cardName = card.name?.toLowerCase() || ''
    if (popularChars.some(char => cardName.includes(char))) {
      score = Math.min(5, score + 0.5)
    }

    const price = card.tcgplayer?.prices?.holofoil?.market ||
                  card.tcgplayer?.prices?.normal?.market ||
                  card.tcgplayer?.prices?.['1stEditionHolofoil']?.market ||
                  0

    if (price > 20) {
      score = Math.min(5, score + 0.5)
    }

    return { score, price }
  }

  const getPriceVariants = (card) => {
    const prices = card.tcgplayer?.prices || {}
    const variants = []

    if (prices.holofoil?.market) {
      variants.push({ type: 'Holofoil', price: prices.holofoil.market })
    }
    if (prices.normal?.market) {
      variants.push({ type: 'Normal', price: prices.normal.market })
    }
    if (prices['1stEditionHolofoil']?.market) {
      variants.push({ type: '1st Ed Holo', price: prices['1stEditionHolofoil'].market })
    }
    if (prices.reverseHolofoil?.market) {
      variants.push({ type: 'Reverse Holo', price: prices.reverseHolofoil.market })
    }

    return variants
  }

  const hasPremiumHolo = (card) => {
    const prices = card.tcgplayer?.prices || {}
    const holo = prices.holofoil?.market || 0
    const normal = prices.normal?.market || 0
    return holo > 0 && normal > 0 && holo > normal * 3
  }

  const searchCards = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a Pokemon name')
      return
    }

    setLoading(true)
    setResults([])

    try {
      const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(searchTerm)}&pageSize=50`
      const response = await fetch(url)
      const data = await response.json()

      const scoredCards = data.data
        .map(card => ({
          ...card,
          ...calculateInvestmentScore(card)
        }))
        .filter(card => card.price > 0)
        .sort((a, b) => b.score - a.score)

      setResults(scoredCards)
    } catch (error) {
      console.error('Error searching cards:', error)
      alert('Failed to search cards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCards()
    }
  }

  const saveToTargetList = (card) => {
    const targetList = JSON.parse(localStorage.getItem('targetList') || '[]')
    if (!targetList.find(c => c.id === card.id)) {
      targetList.push({ ...card, notes: '', savedAt: new Date().toISOString() })
      localStorage.setItem('targetList', JSON.stringify(targetList))
      alert(`${card.name} added to your Target List!`)
    } else {
      alert('Card already in your Target List')
    }
  }

  const setAlert = (card) => {
    const targetPrice = prompt(`Set price alert for ${card.name}. You'll be notified when price drops to or below:`, card.price.toFixed(2))
    if (targetPrice && !isNaN(targetPrice)) {
      const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
      alerts.push({
        cardId: card.id,
        cardName: card.name,
        targetPrice: parseFloat(targetPrice),
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('priceAlerts', JSON.stringify(alerts))
      setPriceAlerts(alerts)
      alert(`Alert set for ${card.name} at $${targetPrice}`)
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🔍 Search Pokemon Cards</h2>

      {/* Price Alert Banner */}
      {alertBanner.length > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded">
          <h3 className="font-bold text-green-800 mb-2">🔔 Price Alerts Triggered!</h3>
          {alertBanner.map((alert, idx) => (
            <p key={idx} className="text-green-700">
              {alert.cardName} is now ${alert.currentPrice.toFixed(2)} (target: ${alert.targetPrice.toFixed(2)})
            </p>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Pokemon name (e.g., Charizard, Pikachu)"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
          />
          <button
            onClick={searchCards}
            disabled={loading}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-all disabled:bg-gray-400"
          >
            Search
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Search by Pokemon name to see investment scores and current market prices
        </p>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="spinner"></div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="text-lg text-gray-700 mb-4">
            Found {results.length} cards matching "{searchTerm}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(card => {
              const priceVariants = getPriceVariants(card)
              const premiumHolo = hasPremiumHolo(card)
              const psaScore = calculatePSAScore(card)
              const isSecretRare = card.number && card.set?.printedTotal && parseInt(card.number) > parseInt(card.set.printedTotal)

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden card-hover"
                >
                  <img
                    src={card.images.small}
                    alt={card.name}
                    className="w-full h-64 object-contain bg-gray-100 p-4"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{card.set.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{card.rarity}</p>

                    {/* Set Scarcity */}
                    <div className="mb-3 text-xs text-gray-600">
                      <span>{card.number}/{card.set?.printedTotal || '?'}</span>
                      {isSecretRare && (
                        <span className="ml-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-bold">SECRET RARE</span>
                      )}
                      {card.set?.releaseDate && (
                        <div className="text-gray-500 mt-1">Released: {card.set.releaseDate}</div>
                      )}
                    </div>

                    {/* Price Variants Table */}
                    {priceVariants.length > 0 && (
                      <div className="mb-3 border border-gray-200 rounded overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left p-2">Variant</th>
                              <th className="text-right p-2">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {priceVariants.map((variant, idx) => (
                              <tr key={idx} className="border-t border-gray-200">
                                <td className="p-2">{variant.type}</td>
                                <td className="text-right p-2 font-bold text-green-600">
                                  ${variant.price.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {premiumHolo && (
                          <div className="bg-red-100 text-red-800 px-2 py-1 text-xs font-bold flex items-center justify-center">
                            🔥 Premium Holo
                          </div>
                        )}
                      </div>
                    )}

                    {/* PSA Potential Score */}
                    <div className={`mb-3 font-semibold ${getPSAColor(psaScore)}`}>
                      PSA Potential: {psaScore}/10
                    </div>

                    {/* Investment Score */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-700">Investment Score:</span>
                      <span className="text-yellow-500 text-xl">
                        {'⭐'.repeat(Math.floor(card.score))}
                        {card.score % 1 !== 0 && '½'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveToTargetList(card)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all text-sm"
                      >
                        Add to Target
                      </button>
                      <button
                        onClick={() => setAlert(card)}
                        className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition-all text-sm"
                      >
                        Set Alert
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No cards found for "{searchTerm}". Try a different Pokemon name.
          </p>
        </div>
      )}
    </div>
  )
}

export default Search
