import { useState } from 'react'

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

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

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🔍 Search Pokemon Cards</h2>

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
            {results.map(card => (
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
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ${card.price.toFixed(2)}
                    </span>
                    <span className="text-yellow-500 text-xl">
                      {'⭐'.repeat(Math.floor(card.score))}
                      {card.score % 1 !== 0 && '½'}
                    </span>
                  </div>
                  <button
                    onClick={() => saveToTargetList(card)}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
                  >
                    Add to Target List
                  </button>
                </div>
              </div>
            ))}
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
