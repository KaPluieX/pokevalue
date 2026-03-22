import { useState, useEffect } from 'react'

const TargetList = () => {
  const [targetList, setTargetList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    loadTargetList()
  }, [])

  const loadTargetList = () => {
    const saved = JSON.parse(localStorage.getItem('targetList') || '[]')
    setTargetList(saved)
  }

  const removeCard = (cardId) => {
    if (confirm('Remove this card from your Target List?')) {
      const updated = targetList.filter(c => c.id !== cardId)
      localStorage.setItem('targetList', JSON.stringify(updated))
      setTargetList(updated)
    }
  }

  const startEditing = (card) => {
    setEditingId(card.id)
    setEditNotes(card.notes || '')
  }

  const saveNotes = (cardId) => {
    const updated = targetList.map(c =>
      c.id === cardId ? { ...c, notes: editNotes } : c
    )
    localStorage.setItem('targetList', JSON.stringify(updated))
    setTargetList(updated)
    setEditingId(null)
    setEditNotes('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditNotes('')
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear your entire Target List? This cannot be undone.')) {
      localStorage.setItem('targetList', '[]')
      setTargetList([])
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🎯 Target List</h2>
        {targetList.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {targetList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">
            Your Target List is empty
          </p>
          <p className="text-gray-500">
            Add cards from the Advisor or Search tabs to track them here
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-700 mb-6">
            Tracking {targetList.length} card{targetList.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetList.map(card => (
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

                  {/* Notes Section */}
                  <div className="mb-3">
                    {editingId === card.id ? (
                      <div>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add notes about this card..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 focus:border-blue-500 focus:outline-none"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNotes(card.id)}
                            className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700 transition-all text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 bg-gray-400 text-white py-1 rounded hover:bg-gray-500 transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {card.notes ? (
                          <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">
                            {card.notes}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 mb-2 italic">
                            No notes yet
                          </p>
                        )}
                        <button
                          onClick={() => startEditing(card)}
                          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all text-sm"
                        >
                          {card.notes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeCard(card.id)}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-all"
                  >
                    Remove from List
                  </button>

                  {/* Saved Date */}
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Added {new Date(card.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TargetList
