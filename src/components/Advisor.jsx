import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Advisor = () => {
  const [budget, setBudget] = useState(100)
  const [eras, setEras] = useState({
    vintage: false,
    classic: false,
    modern: false,
    current: false,
    popular: false,
  })
  const [risk, setRisk] = useState('balanced')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const budgetPresets = [25, 50, 100, 250, 500]

  const toggleEra = (era) => {
    setEras({ ...eras, [era]: !eras[era] })
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

    if (price <= budget) {
      score = Math.min(5, score + 0.5)
    }

    return { score, price }
  }

  const buildQuery = () => {
    const queries = []

    if (eras.vintage) queries.push('set.series:Base OR set.series:Jungle OR set.series:Fossil')
    if (eras.classic) queries.push('set.series:"HeartGold & SoulSilver" OR set.series:"Black & White"')
    if (eras.modern) queries.push('set.series:XY OR set.series:"Sun & Moon" OR set.series:"Sword & Shield"')
    if (eras.current) queries.push('set.series:"Scarlet & Violet"')
    if (eras.popular) queries.push('(name:charizard OR name:pikachu OR name:mewtwo OR name:eevee OR name:gengar)')

    if (queries.length === 0) {
      return 'rarity:"Rare Holo"' // Default query
    }

    return `(${queries.join(' OR ')})`
  }

  const findCards = async () => {
    setLoading(true)
    setResults(null)

    try {
      const query = buildQuery()
      const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=100`

      const response = await fetch(url)
      const data = await response.json()

      // Filter and score cards
      const scoredCards = data.data
        .map(card => ({
          ...card,
          ...calculateInvestmentScore(card)
        }))
        .filter(card => card.price > 0 && card.price <= budget) // Only cards with price data and within budget
        .sort((a, b) => {
          // Sort by investment score first, then by price
          if (b.score !== a.score) return b.score - a.score
          return b.price - a.price
        })
        .slice(0, 10) // Top 10 recommendations

      setResults(scoredCards)
    } catch (error) {
      console.error('Error fetching cards:', error)
      alert('Failed to fetch cards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateAnalysis = () => {
    if (!results || results.length === 0) return ''

    const avgPrice = (results.reduce((sum, c) => sum + c.price, 0) / results.length).toFixed(2)
    const avgScore = (results.reduce((sum, c) => sum + c.score, 0) / results.length).toFixed(1)
    const topCard = results[0]

    const eraText = Object.keys(eras).filter(k => eras[k]).join(', ') || 'general'

    let riskAnalysis = ''
    if (risk === 'conservative') {
      riskAnalysis = 'focusing on high-demand, stable cards that reliably hold value'
    } else if (risk === 'balanced') {
      riskAnalysis = 'balancing proven performers with cards showing growth potential'
    } else {
      riskAnalysis = 'targeting lower-priced rares with strong upside potential'
    }

    return `With your $${budget} budget and interest in ${eraText} cards, your strongest plays are ${riskAnalysis}. ` +
           `I found ${results.length} cards averaging $${avgPrice} with an investment score of ${avgScore}/5. ` +
           `Top recommendation: ${topCard.name} from ${topCard.set.name} at $${topCard.price.toFixed(2)} ` +
           `(${topCard.score}★ score) - ${topCard.rarity}. ` +
           `${topCard.score >= 4 ? 'This is a premium card with strong collector demand.' :
             topCard.score >= 3 ? 'Solid mid-tier investment with growth potential.' :
             'Entry-level investment suitable for building portfolio diversity.'}`
  }

  const getChartData = () => {
    if (!results || results.length === 0) return null

    return {
      labels: results.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name),
      datasets: [
        {
          label: 'Market Price ($)',
          data: results.map(c => c.price),
          backgroundColor: 'rgba(238, 21, 21, 0.8)',
        },
        {
          label: 'Investment Score',
          data: results.map(c => c.score),
          backgroundColor: 'rgba(255, 203, 5, 0.8)',
        },
      ],
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">💡 Investment Advisor</h2>

      {/* Budget Input */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Budget ($)
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
          min="1"
        />
        <div className="flex gap-2 mt-3 flex-wrap">
          {budgetPresets.map(preset => (
            <button
              key={preset}
              onClick={() => setBudget(preset)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                budget === preset
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>

      {/* Era Preferences */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Era Preferences (select any)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={eras.vintage}
              onChange={() => toggleEra('vintage')}
              className="w-5 h-5 text-red-600"
            />
            <span>Vintage (1999-2003)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={eras.classic}
              onChange={() => toggleEra('classic')}
              className="w-5 h-5 text-red-600"
            />
            <span>Classic (2010-2013)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={eras.modern}
              onChange={() => toggleEra('modern')}
              className="w-5 h-5 text-red-600"
            />
            <span>Modern (2014-2022)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={eras.current}
              onChange={() => toggleEra('current')}
              className="w-5 h-5 text-red-600"
            />
            <span>Current (2023+)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={eras.popular}
              onChange={() => toggleEra('popular')}
              className="w-5 h-5 text-red-600"
            />
            <span>Popular Characters</span>
          </label>
        </div>
      </div>

      {/* Risk Appetite */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Risk Appetite
        </label>
        <div className="flex gap-4">
          {['conservative', 'balanced', 'aggressive'].map(riskLevel => (
            <label key={riskLevel} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="risk"
                value={riskLevel}
                checked={risk === riskLevel}
                onChange={(e) => setRisk(e.target.value)}
                className="w-5 h-5 text-red-600"
              />
              <span className="capitalize">{riskLevel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Find Cards Button */}
      <button
        onClick={findCards}
        disabled={loading}
        className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-8"
      >
        {loading ? 'Finding Cards...' : '🔍 Find My Cards'}
      </button>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="spinner"></div>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div>
          {/* Analysis Text */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded">
            <h3 className="font-bold text-xl mb-2 text-gray-800">📊 Investment Analysis</h3>
            <p className="text-gray-700 leading-relaxed">{generateAnalysis()}</p>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Price vs Investment Score</h3>
            <Bar
              data={getChartData()}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>

          {/* Cards Grid */}
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

      {results && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No cards found matching your criteria. Try adjusting your budget or era preferences.
          </p>
        </div>
      )}
    </div>
  )
}

export default Advisor
