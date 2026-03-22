import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([])
  const [targetList, setTargetList] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadPortfolio()
    loadTargetList()
  }, [])

  const loadPortfolio = () => {
    const saved = JSON.parse(localStorage.getItem('portfolio') || '[]')
    setPortfolio(saved)
  }

  const loadTargetList = () => {
    const saved = JSON.parse(localStorage.getItem('targetList') || '[]')
    setTargetList(saved)
  }

  const openAddModal = (card) => {
    setSelectedCard(card)
    setPurchasePrice(card.price.toFixed(2))
    setQuantity(1)
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setShowAddModal(true)
  }

  const addToPortfolio = () => {
    if (!selectedCard || !purchasePrice || !quantity) {
      alert('Please fill all fields')
      return
    }

    const newEntry = {
      id: Date.now().toString(),
      card: selectedCard,
      purchasePrice: parseFloat(purchasePrice),
      quantity: parseInt(quantity),
      purchaseDate,
      addedAt: new Date().toISOString()
    }

    const updated = [...portfolio, newEntry]
    localStorage.setItem('portfolio', JSON.stringify(updated))
    setPortfolio(updated)
    setShowAddModal(false)
    setSelectedCard(null)
  }

  const removeFromPortfolio = (id) => {
    if (confirm('Remove this card from your portfolio?')) {
      const updated = portfolio.filter(p => p.id !== id)
      localStorage.setItem('portfolio', JSON.stringify(updated))
      setPortfolio(updated)
    }
  }

  const calculateStats = () => {
    let totalInvested = 0
    let currentValue = 0

    portfolio.forEach(entry => {
      totalInvested += entry.purchasePrice * entry.quantity
      currentValue += entry.card.price * entry.quantity
    })

    const gainLoss = currentValue - totalInvested
    const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0

    return { totalInvested, currentValue, gainLoss, gainLossPercent }
  }

  const getChartData = () => {
    if (portfolio.length === 0) return null

    const data = portfolio.map(entry => {
      const invested = entry.purchasePrice * entry.quantity
      const current = entry.card.price * entry.quantity
      return {
        name: entry.card.name,
        value: current - invested
      }
    })

    return {
      labels: data.map(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name),
      datasets: [{
        label: 'Gain/Loss ($)',
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.value >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)')
      }]
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Purchase Price', 'Qty', 'Current Price', 'Gain/Loss']
    const rows = portfolio.map(entry => {
      const gainLoss = (entry.card.price - entry.purchasePrice) * entry.quantity
      return [
        entry.card.name,
        entry.purchasePrice.toFixed(2),
        entry.quantity,
        entry.card.price.toFixed(2),
        gainLoss.toFixed(2)
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pokevalue-portfolio-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const stats = calculateStats()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">💼 Portfolio Tracker</h2>
        {portfolio.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Stats Dashboard */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold">Total Invested</p>
            <p className="text-2xl font-bold text-blue-900">${stats.totalInvested.toFixed(2)}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-sm text-purple-800 font-semibold">Current Value</p>
            <p className="text-2xl font-bold text-purple-900">${stats.currentValue.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg ${stats.gainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`text-sm font-semibold ${stats.gainLoss >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Gain/Loss ($)
            </p>
            <p className={`text-2xl font-bold ${stats.gainLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {stats.gainLoss >= 0 ? '+' : ''}${stats.gainLoss.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${stats.gainLossPercent >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`text-sm font-semibold ${stats.gainLossPercent >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Gain/Loss (%)
            </p>
            <p className={`text-2xl font-bold ${stats.gainLossPercent >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {stats.gainLossPercent >= 0 ? '+' : ''}{stats.gainLossPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {portfolio.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="font-bold text-xl mb-4 text-gray-800">Performance by Card</h3>
          <Bar
            data={getChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => '$' + value
                  }
                }
              }
            }}
          />
        </div>
      )}

      {/* Add from Target List */}
      {targetList.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add from Target List</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {targetList.map(card => (
              <div key={card.id} className="bg-white p-3 rounded-lg shadow border border-gray-200">
                <img src={card.images.small} alt={card.name} className="w-full h-32 object-contain mb-2" />
                <p className="font-semibold text-sm mb-1">{card.name}</p>
                <p className="text-xs text-gray-600 mb-2">${card.price.toFixed(2)}</p>
                <button
                  onClick={() => openAddModal(card)}
                  className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition-all text-sm"
                >
                  Add to Portfolio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Cards */}
      {portfolio.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Portfolio ({portfolio.length} entries)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map(entry => {
              const invested = entry.purchasePrice * entry.quantity
              const current = entry.card.price * entry.quantity
              const gainLoss = current - invested
              const gainLossPercent = (gainLoss / invested) * 100

              return (
                <div key={entry.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img
                    src={entry.card.images.small}
                    alt={entry.card.name}
                    className="w-full h-48 object-contain bg-gray-100 p-4"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{entry.card.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{entry.card.set.name}</p>

                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold">{entry.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Price:</span>
                        <span className="font-semibold">${entry.purchasePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Price:</span>
                        <span className="font-semibold">${entry.card.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Invested:</span>
                        <span className="font-semibold">${invested.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Value:</span>
                        <span className="font-semibold">${current.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-semibold">Gain/Loss:</span>
                        <span className={`font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Purchased: {new Date(entry.purchaseDate).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => removeFromPortfolio(entry.id)}
                      className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Your portfolio is empty</p>
          <p className="text-gray-500">
            {targetList.length > 0
              ? 'Add cards from your Target List above to start tracking your investments'
              : 'Add cards to your Target List first, then add them to your portfolio'}
          </p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add to Portfolio</h3>
            <div className="mb-4">
              <p className="font-semibold">{selectedCard.name}</p>
              <p className="text-sm text-gray-600">{selectedCard.set.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Purchase Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={addToPortfolio}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
