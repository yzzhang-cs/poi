import { connect } from 'react-redux'
import classNames from 'classnames'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import { get, memoize, times } from 'lodash'
import { createSelector } from 'reselect'
import { translate, Trans } from 'react-i18next'
import { Card, Button, ButtonGroup } from '@blueprintjs/core'
import { compose } from 'redux'

const { dispatch } = window

import { ScrollShadow } from 'views/components/etc/scroll-shadow'
import { ShipRow } from './ship-item'
import { SquardRow } from './lbac-view'
import { LandbaseButton } from '../ship-parts/landbase-button'
import { TopAlert } from 'views/components/ship-parts/topalert'
import {
  fleetNameSelectorFactory,
  fleetStateSelectorFactory,
  fleetShipsIdSelectorFactory,
} from 'views/utils/selectors'
import { layoutResizeObserver } from 'views/services/layout'
import { getFleetIntent, DEFAULT_FLEET_NAMES } from 'views/utils/game-utils'

import './assets/ship.css'

const shipRowWidthSelector = state => get(state, 'layout.shippane.width', 450)

const shipViewSwitchButtonDataSelectorFactory = memoize(fleetId =>
  createSelector(
    [fleetNameSelectorFactory(fleetId), fleetStateSelectorFactory(fleetId)],
    (fleetName, fleetState) => ({
      fleetState,
      fleetName,
    }),
  ),
)

const ShipViewSwitchButton = connect((state, { fleetId }) =>
  shipViewSwitchButtonDataSelectorFactory(fleetId)(state),
)(({ fleetId, activeFleetId, fleetName, fleetState, onClick, disabled }) => (
  <Button
    intent={getFleetIntent(fleetState, disabled)}
    onClick={onClick}
    disabled={disabled}
    className={fleetId == activeFleetId ? 'active' : ''}
  >
    {fleetName || DEFAULT_FLEET_NAMES[fleetId]}
  </Button>
))

const fleetShipViewDataSelectorFactory = memoize(fleetId =>
  createSelector([fleetShipsIdSelectorFactory(fleetId)], shipsId => ({
    shipsId,
  })),
)

const FleetShipView = connect((state, { fleetId }) =>
  fleetShipViewDataSelectorFactory(fleetId)(state),
)(({ fleetId, shipsId, enableAvatar, width }) => (
  <>
    <div className="fleet-name">
      <TopAlert fleetId={fleetId} isMini={false} />
    </div>
    <ScrollShadow
      className="ship-details"
      observerPath={['layout.shippane', `info.fleets.${fleetId}.api_ship`]}
    >
      {(shipsId || []).map((shipId, i) => (
        <ShipRow key={shipId} shipId={shipId} enableAvatar={enableAvatar} compact={width < 480} />
      ))}
    </ScrollShadow>
  </>
))

const LBView = compose(
  translate(['resources']),
  connect(state => ({
    areaIds: get(state, 'info.airbase', []).map(a => a.api_area_id),
    mapareas: get(state, 'const.$mapareas', {}),
  })),
)(({ areaIds, mapareas, t, enableAvatar, width }) => (
  <ScrollShadow className="ship-details" observerPath={['layout.shippane', 'info.airbase']}>
    {areaIds.map(
      (id, i) =>
        mapareas[id] != null &&
        (id === areaIds[i - 1] ? (
          <SquardRow key={i} squardId={i} enableAvatar={enableAvatar} compact={width < 480} />
        ) : (
          <React.Fragment key={i}>
            <div style={{ color: window.isDarkTheme ? '#FFF' : '#000' }} className="airbase-area">
              [{id}] {mapareas[id] ? t(`resources:${mapareas[id].api_name}`) : ''}
            </div>
            <SquardRow key={i} squardId={i} enableAvatar={enableAvatar} compact={width < 480} />
          </React.Fragment>
        )),
    )}
  </ScrollShadow>
))

@connect((state, props) => ({
  enableTransition: get(state, 'config.poi.transition.enable', true),
  fleetCount: get(state, 'info.fleets.length', 4),
  activeFleetId: get(state, 'ui.activeFleetId', 0),
  airBaseCnt: get(state, 'info.airbase.length', 0),
  enableAvatar: get(state, 'config.poi.appearance.avatar', true),
  width: shipRowWidthSelector(state),
}))
export class reactClass extends Component {
  static propTypes = {
    enableTransition: PropTypes.bool.isRequired,
    fleetCount: PropTypes.number.isRequired,
    activeFleetId: PropTypes.number.isRequired,
    airBaseCnt: PropTypes.number.isRequired,
    enableAvatar: PropTypes.bool,
    width: PropTypes.number,
  }

  constructor(props) {
    super(props)
    this.nowTime = 0
  }

  handleClick = idx => {
    if (idx != this.props.activeFleetId) {
      dispatch({
        type: '@@TabSwitch',
        tabInfo: {
          activeFleetId: idx,
        },
      })
    }
  }

  changeMainView = () => {
    dispatch({
      type: '@@TabSwitch',
      tabInfo: {
        activeMainTab: 'main-view',
      },
    })
  }

  componentWillUnmount() {
    layoutResizeObserver.unobserve(this.shiptabpane)
  }

  componentDidMount() {
    layoutResizeObserver.observe(this.shiptabpane)
  }

  render() {
    return (
      <div className="ship-wrapper">
        <Card onDoubleClick={this.changeMainView} className="ship-card">
          <div className="div-row fleet-name-button-container">
            <ButtonGroup className="fleet-name-button">
              {times(4).map(i => (
                <ShipViewSwitchButton
                  key={i}
                  fleetId={i}
                  disabled={i + 1 > this.props.fleetCount}
                  onClick={e => this.handleClick(i)}
                  activeFleetId={this.props.activeFleetId}
                />
              ))}
            </ButtonGroup>
            <LandbaseButton
              key={4}
              fleetId={4}
              disabled={this.props.airBaseCnt === 0}
              onClick={e => this.handleClick(4)}
              activeFleetId={this.props.activeFleetId}
              isMini={false}
            />
          </div>
          <div
            className="no-scroll ship-tab-container"
            ref={ref => {
              this.shiptabpane = ref
            }}
          >
            <div
              className={classNames('ship-tab-content', {
                'ship-tab-content-transition': this.props.enableTransition,
              })}
              style={{ transform: `translateX(-${this.props.activeFleetId}00%)` }}
            >
              {times(4).map(i => (
                <div className="ship-deck" key={i}>
                  <FleetShipView
                    fleetId={i}
                    enableAvatar={this.props.enableAvatar}
                    width={this.props.width}
                  />
                </div>
              ))}
              <div className="ship-deck ship-lbac" key={4}>
                <LBView enableAvatar={this.props.enableAvatar} width={this.props.width} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }
}

export const displayName = (
  <span>
    <FontAwesome key={0} name="bars" /> <Trans>main:Fleet</Trans>
  </span>
)
