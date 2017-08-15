export const selectedBanks = [
  {
    'name': 'Stanbic Bank',
    'tags': [
      'Stanbic'
    ]
  },
  {
    'name': 'DFCU Bank',
    'tags': [
      'DFCU',
      'dfcu'
    ]
  },
  {
    'name': 'Barclays Bank',
    'tags': [
      'Barclays',
      'barclays'
    ]
  },
  {
    'name': 'Pride Microfinance',
    'tags': [
      'Pride Microfinance',
      'Pride Micro'
    ]
  },
  {
    'name': 'Finca Bank',
    'tags': [
      'Finca'
    ]
  },
  {
    'name': 'Finance Trust',
    'tags': [
      'Finance Trust'
    ]
  },
  {
    'name': 'Centenary Bank',
    'tags': [
      'Centenary'
    ]
  },
  {
    'name': 'Bank of Africa',
    'tags': [
      'Bank of Africa'
    ]
  },
  {
    'name': 'Kenya Commercial Bank',
    'tags': [
      'Kenya Commercial Bank',
      'KCB',
      'kcb'
    ]
  },
  {
    'name': 'Orient Bank',
    'tags': [
      'Orient'
    ]
  },
  {
    'name': 'Housing Finance Bank',
    'tags': [
      'Housing Finance'
    ]
  },
  {
    'name': 'Crane Bank',
    'tags': [
      'Crane Bank'
    ]
  },
  {
    'name': 'Diamond Trust Bank',
    'tags': [
      'DTB',
      'Diamond Trust'
    ]
  },
  {
    'name': 'Opportunity Bank',
    'tags': [
      'Opportunity Bank'
    ]
  },
  {
    'name': 'Global Trust Bank',
    'tags': [
      'Global Trust'
    ]
  },
  {
    'name': 'Postbank',
    'tags': [
      'Postbank',
      'Post Bank'
    ]
  },
  {
    'name': 'Bank of Baroda',
    'tags': [
      'Bank of Baroda',
      'Baroda'
    ]
  },
  {
    'name': 'UBA Bank',
    'tags': [
      'UBA'
    ]
  },
  {
    'name': 'Standard Chartered',
    'tags': [
      'Standard Chartered'
    ]
  },
  {
    'name': 'Equity Bank',
    'tags': [
      'Equity Bank'
    ]
  },
  {
    'name': 'Uganda Commercial Bank',
    'tags': [
      'Uganda Commercial Bank',
      'UCB'
    ]
  },
  {
    'name': 'EcoBank',
    'tags': [
      'EcoBank',
      'Eco Bank'
    ]
  },
  {
    'name': 'unknown',
    'tags': [
      'unknown'
    ]
  }
]

export const menu = [
  {
    id: 'uganda',
    description: 'Financial Services Uganda',
    subMenu: [
      {
        id: 'mobilemoney',
        description: 'Mobile Money Agents'
      },
      {
        id: 'mmdistbanks',
        description: 'Distance from Banks/ATMs'
      },
      {
        id: 'qn3',
        description: 'Distribution of Banks'
      },
      {
        id: 'qn4',
        description: 'Distribution of FSPs'
      }
    ]
  },
  {
    id: 'kenya',
    description: 'Financial Services Kenya'
  }
]

export const controls = {
  uganda: {
    mobilemoney: {
      title: 'Mobile money agents in relation to population and economic activity',
      legend: 'Number of Agents',
      controls: [
        {
          id: 'peoplePerAgent',
          type: 'range',
          field: '_peoplePerAgent',
          title: 'People per agent',
          label: 'people',
          range: {max: 4000, min: 0, selection: [0, 4000]}
        },
        {
          id: 'population',
          type: 'range',
          field: '_populationDensity',
          title: 'Population density',
          label: 'people/cell (,000)',
          range: {max: 15000, min: 0, selection: [0, 2500]}
        },
        {
          id: 'economic',
          type: 'range',
          field: '_economicActivity',
          title: 'Economic activity',
          label: '(1 : Low , 10 : High)',
          range: {max: 10, min: 0, selection: [0, 8]}
        }
      ]
    },
    mmdistbanks: {

      title: 'Show mobile money agents that are (at least) a distance from a bank or ATM',
      legend: 'Number of Agents',
      controls: [
        {
          id: 'distance-from-bank',
          type: 'range',
          category: 'bank',
          field: '_distanceFromBank',
          title: 'Distance from banks',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        },
        {
          id: 'distance-from-atm',
          type: 'range',
          category: 'atm',
          field: '_distanceFromATM',
          title: 'Distance from ATM',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        },
        {
          id: 'distance-selector-bank',
          type: 'combo',
          category: 'bank',
          field: '_bank_',
          data: [...selectedBanks],
          title: 'Select bank',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        },
        {
          id: 'distance-selector-atm',
          type: 'combo',
          category: 'atm',
          field: '_atm_',
          data: [...selectedBanks],
          title: 'Select ATM',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        }
      ]
    },
    qn3: {
      title: 'Show location of selected banks in relation to population density and economic activity',
      controls: [
        {
          id: 'population',
          type: 'range',
          title: 'Population density',
          label: 'people/cell (,000)',
          range: {max: 10, min: 0, selection: [2, 6]}
        },
        {
          id: 'economic',
          type: 'range',
          title: 'Economic activity',
          label: '(1 : Low , 8 : High)',
          range: {max: 8, min: 0, selection: [2, 4]}
        }
      ]
    },
    qn4: {
      title: 'Show location of Banks/ ATMs in relation to population density ',
      controls: []
    }
  },
  kenya: {},

}