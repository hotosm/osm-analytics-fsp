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
const disclaimer = "https://github.com/hotosm/osm-analytics-fsp/blob/master/README.md"
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
    region: 'polygon:{isbEcr|Tzmi@mmi@rvq@xyWheaA}|T~tbAvcm@tbZli}EagkBxkr@hbdGt`kGwfAtur@~~n@nzqAzm]xnpF_tOvrn@mk^wyMkl_@|qZqleAqjiAufqA_fOklhRrtA|_CwwuEmpqB}|yD{xx@yn_@c{d@wftA|wEgw}CpbaByjrCoEi`jAxlx@add@tm`@eosAxl{Axq|AhpsAecRlmsBdxRlbv@|wm@',
    mobilemoney: {
      title: 'Mobile money agents in relation to population and economic activity',
      tooltip: {
        title: '',
        body: `
        <p>
            As a financial service provider I can then decide to or not set up a mobile money agent within that radius.
            <br/>This decision will of course be based on how many people are found in that radius as well as the type
            of economic activity.
            <ul>
              <li>Grid with population and economic activity weighted figure (determined by no. of buildings, commercial
                buildings and proximity to primary roads).
              </li>
              <li>Users will drill down to identify cells that have specific populations and economic activity.</li>
            </ul>
          </p>
          <a href="${disclaimer}" target="_blank"><b>View disclaimer</b></a>
        `
      },
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
      tooltip: {
        title: '',
        body: `
        <p>
            As a financial service provider I can then decide to or not set up a bank branch closer to the mobile money 
            agents for them to be able to deposit the money that they collect from the mobile money users
            <ul>
              <li>Users can filter to identify areas with the number of MM agents at specified distances from a bank, 
              no. within &lt; 1km, 1-5, 5-10 km, and 10km+ (in addition to free form input for distance)
              </li>
            </ul>
          </p>
          <a href="${disclaimer}" target="_blank"><b>View disclaimer</b></a>
        `
      },
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
      tooltip: {
        header: '',
        body: `
        <p>
            As a financial service provider I can then decide to or not set up an atm or bank branch based on the
             presence of my competitor financial service providers.
            <ul>
              <li>Users can select the type of service (ATM/branch) and the FSP </li>
              <li>The map grid will show all grid cells in which the services for each selected FSP will appear. </li>
            </ul>
          </p>
          <a href="${disclaimer}" target="_blank"><b>View disclaimer</b></a>
        `
      },
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
      tooltip: {
        header: '',
        body: `
        <p>
            As a financial service provider I can evaluate the areas with few competitors
            <ul>
              <li>Users can filter a gridded map to display areas with a specific number of people per MM Agent. </li>
              <li>This can be split according to provider/network </li>
            </ul>
          </p>
          <a href="${disclaimer}" target="_blank"><b>View disclaimer</b></a>
        `
      },
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