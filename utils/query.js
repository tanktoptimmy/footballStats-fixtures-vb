export const query = `query MarketQueryRenderer_MarketsQuery(
  $eventFilter: EventFilter
  $marketFilter: MarketFilter
  $outcomeOrderBy: String
  $outcomeOrderByDirection: OrderDirection
) {
  events(filter: $eventFilter) {
    name
    startTime
    eventId
    classId
    eventType{
      name
      typeId
    }
    markets(filter: $marketFilter) {
      ...StandardMarket_market
      outcomes @order(by: $outcomeOrderBy, direction: $outcomeOrderByDirection) {
        outcomeId
      }
    }
  }
}

fragment Outcome_outcome on Outcome {
  outcomeId
  name
  price {
    decimal
    num
    den
  }
  status {
    suspended
    displayable
  }
}

fragment StandardMarket_market on Market {
  marketId
  name
  outcomes @order(by: $outcomeOrderBy, direction: $outcomeOrderByDirection) {
    originalOutcome {
      outcomeId
      status {
        suspended
      }
      price {
        den
        num
        decimal
      }
    }
    ...Outcome_outcome
  }
}
`

export const variables = {
  eventFilter: {
    HAS: ['markets'],
    isOutright: false,
    isSpecial: false,
    status: {
      displayable: true,
      resulted: false,
      live: false,
      started: false,
      finished: false
    },
    classId: {
      EQ: 5
    }
  },
  marketFilter: {
    status: {
      displayable: true,
      resulted: false
    },
    name: {
      EQ: 'Price Boosts'
    }
  },
  outcomeOrderBy: null,
  outcomeOrderByDirection: null
}
