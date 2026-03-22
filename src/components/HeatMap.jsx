import { useState, useEffect } from 'react'

const HeatMap = () => {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSet, setSelectedSet] = useState(null)

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
    } finally {
      setLoading(false)
    }
  }

  const getSeriesColor = (series) => {
    const s = series?.toLowerCase() || ''
    if (s.includes('scarlet') || s.includes('violet')) {
      return 'bg-gradient-to-br from-red-500 to-red-700 text-white'
    }
    if (s.includes('sword') || s.includes('shield')) {
      return 'bg-gradient-to-br from-orange-500 to-orange-700 text-white'
    }
    if (s.includes('sun') || s.includes('moon')) {
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900'
    }
    if (s.includes('xy')) {
      return 'bg-gradient-to-br from-green-300 to-green-500 text-gray-900'
    }
    // Older sets
    return 'bg-gradient-to-br from-green-600 to-green-800 text-white'
  }

  const getReleaseYear = (releaseDate) => {
    return releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown'
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🗺️ Market Heat Map</h2>

      <p className="text-gray-700 mb-6">
        Explore all Pokemon TCG sets. Color indicates series:
        <span className="ml-2 text-red-600 font-semibold">Red = Scarlet & Violet</span>,
        <span className="ml-2 text-orange-600 font-semibold">Orange = Sword & Shield</span>,
        <span className="ml-2 text-yellow-600 font-semibold">Yellow = Sun & Moon</span>,
        <span className="ml-2 text-green-500 font-semibold">Light Green = XY</span>,
        <span className="ml-2 text-green-700 font-semibold">Dark Green = Older</span>
      </p>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="spinner"></div>
        </div>
      )}

      {/* Sets Grid */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sets.map(set => (
            <div
              key={set.id}
              onClick={() => setSelectedSet(set)}
              className={`${getSeriesColor(set.series)} rounded-lg p-4 shadow-lg cursor-pointer hover:scale-105 transition-transform`}
            >
              <img
                src={set.images.logo}
                alt={set.name}
                className="w-full h-16 object-contain mb-3"
              />
              <h3 className="font-bold text-sm mb-1">{set.name}</h3>
              <p className="text-xs opacity-90 mb-1">{set.series}</p>
              <div className="text-xs opacity-80">
                <p>{set.total} cards</p>
                <p>Released: {getReleaseYear(set.releaseDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Set Detail Modal */}
      {selectedSet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedSet.name}</h3>
                <p className="text-gray-600">{selectedSet.series}</p>
              </div>
              <button
                onClick={() => setSelectedSet(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <img
              src={selectedSet.images.logo}
              alt={selectedSet.name}
              className="w-full h-32 object-contain mb-4 bg-gray-100 rounded"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold">{selectedSet.total}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm text-gray-600">Release Date</p>
                <p className="text-2xl font-bold">{getReleaseYear(selectedSet.releaseDate)}</p>
              </div>
              {selectedSet.printedTotal && (
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm text-gray-600">Printed Total</p>
                  <p className="text-2xl font-bold">{selectedSet.printedTotal}</p>
                </div>
              )}
              {selectedSet.ptcgoCode && (
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm text-gray-600">PTCGO Code</p>
                  <p className="text-xl font-bold">{selectedSet.ptcgoCode}</p>
                </div>
              )}
            </div>

            {selectedSet.legalities && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Legalities</h4>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(selectedSet.legalities).map(([format, legal]) => (
                    <span
                      key={format}
                      className={`px-3 py-1 rounded text-sm ${
                        legal === 'Legal'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {format}: {legal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <a
                href={`https://www.pokemon.com/us/pokemon-tcg/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all text-center"
              >
                View on Pokemon.com
              </a>
              <button
                onClick={() => setSelectedSet(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && sets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No sets found</p>
        </div>
      )}
    </div>
  )
}

export default HeatMap
