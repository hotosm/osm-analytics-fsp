export const selectedBanks = [
  {
    'name': 'Stanbic Bank',
    'color': '#00ffff',
    'tags': [
      'Stanbic'
    ]
  },
  {
    'name': 'DFCU Bank',
    'color': '#9932cc',
    'tags': [
      'DFCU',
      'dfcu'
    ]
  },
  {
    'name': 'Barclays Bank',
    'color': 'blue',
    'tags': [
      'Barclays',
      'barclays'
    ]
  },
  {
    'name': 'Pride Microfinance',
    'color': '#add8e6',
    'tags': [
      'Pride Microfinance',
      'Pride Micro'
    ]
  },
  {
    'name': 'Finca Bank',
    'color': '#00ff00',
    'tags': [
      'Finca'
    ]
  },
  {
    'name': 'Finance Trust',
    'color': '#ff00ff',
    'tags': [
      'Finance Trust'
    ]
  },
  {
    'name': 'Centenary Bank',
    'color': '#90ee90',
    'tags': [
      'Centenary'
    ]
  },
  {
    'name': 'Bank of Africa',
    'color': '#ffff00',
    'tags': [
      'Bank of Africa'
    ]
  },
  {
    'name': 'Kenya Commercial Bank',
    'color': '#ffd700',
    'tags': [
      'Kenya Commercial Bank',
      'KCB',
      'kcb'
    ]
  },
  {
    'name': 'Orient Bank',
    'color': '#90ee90',
    'tags': [
      'Orient'
    ]
  },
  {
    'name': 'Housing Finance Bank',
    'color': '#add8e6',
    'tags': [
      'Housing Finance'
    ]
  },
  {
    'name': 'Crane Bank',
    'color': '#ffffe0',
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
        id: 'popnbankatm',
        description: 'Distribution of Banks'
      },
      {
        id: 'fspdistribution',
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
          range: {max: 12000, min: 0, selection: [0, 12000]}
        },
        {
          id: 'population',
          type: 'range',
          field: '_populationDensity',
          fieldMin: '_populationDensity',
          title: 'Population density',
          label: 'people/cell (,000)',
          range: {max: 15000, min: 0, selection: [0, 15000]}
        },
        {
          id: 'economic',
          type: 'range',
          field: '_economicActivity',
          title: 'Economic activity',
          label: '(1 : Low , 10 : High)',
          range: {max: 10, min: 0, selection: [0, 10]}
        }
      ]
    },
    mmdistbanks: {

      title: 'Show Mobile Money agents that are (at least) a distance from a bank or ATM',
      legend: 'Number of Agents',
      controls: [
        {
          id: 'distance-from-bank',
          type: 'range',
          category: 'bank',
          field: '_distanceFromBank',
          title: 'Distance from banks',
          label: ' Kilometers',
          divisor: 1000,
          range: {max: 10000, min: 0, selection: [0, 10000]}
        },
        {
          id: 'distance-from-atm',
          type: 'range',
          category: 'atm',
          field: '_distanceFromATM',
          title: 'Distance from ATM',
          label: ' Kilometers',
          divisor: 1000,
          range: {max: 10000, min: 0, selection: [0, 10000]}
        },
        {
          id: 'qn2-distance-selector-bank',
          type: 'combo',
          category: 'bank',
          field: '_bank_',
          data: [...selectedBanks],
          title: 'Select bank',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        },
        {
          id: 'qn2-distance-selector-atm',
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
    popnbankatm: {
      title: 'Show location of selected banks in relation to population density and economic activity',
      legend: 'Population density',
      controls: [
        /*
        {
          id: 'population',
          type: 'range',
          field: '_populationDensity',
          title: 'Population density',
          label: 'people/cell (,000)',
          range: {max: 15000, min: 0, selection: [0, 15000]}
        },
        */
        {
          id: 'economic',
          type: 'range',
          field: '_economicActivity',
          title: 'Economic activity',
          label: '(1 : Low , 10 : High)',
          range: {max: 10, min: 0, selection: [0, 10]}
        }, {
          id: 'qn3-distance-selector-bank',
          multi: true,
          type: 'combo',
          category: 'bank',
          field: '_bank_',
          data: [...selectedBanks],
          title: 'Select bank',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        }
      ]
    },
    fspdistribution: {
      title: 'Show location of Financial Service Provider(FSP) in relation to people per FSP ',
      legend: 'People per FSP',
      controls: [
        {
          id: 'fsp-selector',
          type: 'combo',
          category: 'bank',
          field: '_bank_',
          data:
            [
              {name: 'mobile_money_agent', label: 'Mobile Money Agents'},
              {name: 'atm', label: 'ATMS'},
              {name: 'bank', label: 'Banks'},
              {name: 'credit_institution', label: 'Credit Institution'},
              {name: 'microfinance_bank', label: 'Microfinance Bank'},
              {name: 'microfinance', label: 'Microfinance'},
              {name: 'sacco', label: 'Sacco'},
              {name: 'bureau_de_change', label: 'Bureau De Change'},
              {name: 'money_transfer', label: 'Money Transfer'},
              {name: 'post_office', label: 'Post Office'},
            ],
          title: 'Select FSP',
          label: ' meters',
        },
        {
          id: 'qn4-operator-selector',
          type: 'combo',
          multi: true,
          category: 'bank',
          field: '_bank_',
          data: [...selectedBanks],
          title: 'Select Operator',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        }
      ]
    }
  },
  kenya: {},

}