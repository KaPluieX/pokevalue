import { useState } from 'react'
import Advisor from './components/Advisor'
import Search from './components/Search'
import TargetList from './components/TargetList'

function App() {
  const [activeTab, setActiveTab] = useState('advisor')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            ⚡ PokeValue
          </h1>
          <p className="text-yellow-300 text-lg">
            Smart Pokemon Card Investment Advisor for buddyfox33
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-2xl shadow-xl">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-red-600 text-white border-b-4 border-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💡 Advisor
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-red-600 text-white border-b-4 border-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔍 Search
            </button>
            <button
              onClick={() => setActiveTab('targetList')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                activeTab === 'targetList'
                  ? 'bg-red-600 text-white border-b-4 border-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎯 Target List
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-2xl p-6">
            {activeTab === 'advisor' && <Advisor />}
            {activeTab === 'search' && <Search />}
            {activeTab === 'targetList' && <TargetList />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white text-sm opacity-75">
          <p>Powered by Pokemon TCG API • Data updates in real-time</p>
        </div>
      </div>
    </div>
  )
}

export default App
