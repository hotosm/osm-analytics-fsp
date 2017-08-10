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
      controls: [
        {
          id: 'peoplePerAgent',
          type: 'range',
          field:'_peoplePerAgent',
          title: 'People per agent',
          label: 'people',
          range: {max: 4000, min: 0, selection: [0, 4000]}
        },
        {
          id: 'population',
          type: 'range',
          field:'_populationDensity',
          title: 'Population density',
          label: 'people/cell (,000)',
          range: {max: 15000, min: 0, selection: [0, 2500]}
        },
        {
          id: 'economic',
          type: 'range',
          field:'_economicActivity',
          title: 'Economic activity',
          label: '(1 : Low , 10 : High)',
          range: {max: 10, min: 0, selection: [0, 8]}
        }
      ]
    },
    mmdistbanks: {
      title: 'Show mobile money agents that are (at least) a distance from a bank or ATM',
      controls: [
        {
          id: 'distance-from-bank',
          type: 'range',
          field:'_distanceFromBank',
          title: 'Distance from banks',
          label: ' meters',
          range: {max: 20000, min: 0, selection: [300, 7500]}
        },
        {
          id: 'distance-from-atm',
          type: 'range',
          field:'_distanceFromATM',
          title: 'Distance from ATM',
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