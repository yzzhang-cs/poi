import { FormControl, FormGroup, Form, Container, Col, Button, Alert, Collapse } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Divider } from './components/divider'
import { get, pick } from 'lodash'
import { translate } from 'react-i18next'

const { config, toggleModal } = window

const basic = {
  use: 'none',
  pacAddr: '',
  http: {
    host: '127.0.0.1',
    port: 8099,
    requirePassword: false,
    username: '',
    password: '',
  },
  socks5: {
    host: "127.0.0.1",
    port: 1080,
  },
  retries: 0,
  port: 0,
  allowLAN: false,
  showAdvanced: false,
}

@translate(['setting'])
@connect((state, props) => {
  const ret = get(state, 'config.proxy') || {}
  for (const key of Object.keys(basic)) {
    if (ret[key] === undefined) {
      ret[key] = basic[key]
    }
  }
  return ret
})
export class NetworkConfig extends Component {
  constructor(props) {
    super(props)
    this.state = pick(props, Object.keys(basic))
  }
  handleChangeUse = (e) => {
    const use = e.target.value
    this.setState({
      use,
    })
  }
  handleSaveConfig = (e) => {
    const proxy = Object.clone(this.state)
    let retries = parseInt(this.state.retries)
    if (isNaN(retries) || retries < 0) {
      retries = 0
      proxy.retries = 0
    }
    let port = parseInt(this.state.port)
    if (isNaN(port) || port < 1024 || port > 65535) {
      port = 0
      proxy.port = 0
    }
    delete proxy.showAdvanced
    config.set('proxy', proxy)
    this.setState({
      retries,
      port,
    })
    toggleModal(this.props.t('setting:Proxy setting'), this.props.t('setting:Success! It will be available after a restart'))
  }
  handleHttpHostChange = (e) => {
    const http = Object.clone(this.state.http)
    http.host = e.target.value
    this.setState({
      http,
    })
  }
  handleHttpPortChange = (e) => {
    const http = Object.clone(this.state.http)
    http.port = parseInt(e.target.value) || 0
    this.setState({
      http,
    })
  }
  handleSetHttpRequirePassword = (e) => {
    const http = Object.clone(this.state.http)
    http.requirePassword = !http.requirePassword
    this.setState({
      http,
    })
  }
  handleHttpUsernameChange = (e) => {
    const http = Object.clone(this.state.http)
    http.username = e.target.value
    this.setState({
      http,
    })
  }
  handleHttpPasswordChange = (e) => {
    const http = Object.clone(this.state.http)
    http.password = e.target.value
    this.setState({
      http,
    })
  }
  handleSocksHostChange = (e) => {
    const socks5 = Object.clone(this.state.socks5)
    socks5.host = e.target.value
    this.setState({
      socks5,
    })
  }
  handleSocksPortChange = (e) => {
    const socks5 = Object.clone(this.state.socks5)
    socks5.port = parseInt(e.target.value) || 0
    this.setState({
      socks5,
    })
  }
  handlePACAddrChange = (e) => {
    this.setState({
      pacAddr: e.target.value,
    })
  }
  handleSetRetries = (e) => {
    this.setState({
      retries: parseInt(e.target.value) || 0,
    })
  }
  handleSetPort = (e) => {
    this.setState({
      port: parseInt(e.target.value) || 0,
    })
  }
  handleSetAllowLAN = (e) => {
    this.setState({
      allowLAN: !this.state.allowLAN,
    })
  }
  handleShowAdvanced = (e) => {
    this.setState({
      showAdvanced: !this.state.showAdvanced,
    })
  }
  render() {
    const { t } = this.props
    return (
      <form>
        <Divider text={t('setting:Proxy server information')} />
        <Container>
          <Col xs={12}>
            <FormControl as="select" value={this.state.use || "none"} onChange={this.handleChangeUse}>
              <option key={0} value="http">HTTP {t('setting:proxy')}</option>
              <option key={1} value="socks5">Socks5 {t('setting:proxy')}</option>
              <option key={2} value="pac">PAC {t('setting:file')} ({t('setting:Experimental')})</option>
              <option key={3} value="none">{t('setting:No proxy')}</option>
            </FormControl>
          </Col>
        </Container>
        {
          (this.state.use === 'http') ?
            <Container>
              <Col xs={6}>
                <FormGroup>
                  <Form.Label>{t('setting:Proxy server address')}</Form.Label>
                  <FormControl type="text" placeholder={t('setting:Proxy server address')} value={this.state.http.host} onChange={this.handleHttpHostChange} />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Form.Label>{t('setting:Proxy server port')}</Form.Label>
                  <FormControl type="text" placeholder={t('setting:Proxy server port')} value={this.state.http.port} onChange={this.handleHttpPortChange} />
                </FormGroup>
              </Col>
              <Col xs={12}>
                <Form.Check type="checkbox" checked={!!this.state.http.requirePassword} onChange={this.handleSetHttpRequirePassword}>
                  {t('setting:Proxy server requires password')}
                </Form.Check>
              </Col>
              <div style={(!this.state.http.requirePassword) ? {display: 'none'} : {}} >
                <Col xs={6}>
                  <FormGroup>
                    <Form.Label>{t('setting:Username')}</Form.Label>
                    <FormControl type="text" placeholder={t('setting:Username')} value={this.state.http.username} onChange={this.handleHttpUsernameChange} />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup>
                    <Form.Label>{t('setting:Password')}</Form.Label>
                    <FormControl type="password" placeholder={t('setting:Password')} value={this.state.http.password} onChange={this.handleHttpPasswordChange} />
                  </FormGroup>
                </Col>
              </div>

            </Container>
            :(this.state.use == 'socks5') ?
              <Container>
                <Col xs={6}>
                  <FormGroup>
                    <Form.Label>{t('setting:Proxy server address')}</Form.Label>
                    <FormControl type="text" placeholder={t('setting:Proxy server address')} value={this.state.socks5.host} onChange={this.handleSocksHostChange} />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup>
                    <Form.Label>{t('setting:Proxy server port')}</Form.Label>
                    <FormControl type="text" placeholder={t('setting:Proxy server port')} value={this.state.socks5.port} onChange={this.handleSocksPortChange} />
                  </FormGroup>
                </Col>
              </Container>
              : (this.state.use === 'pac') ?
                <Container>
                  <Col xs={12}>
                    <FormGroup>
                      <Form.Label>{t('setting:PAC address')}</Form.Label>
                      <FormControl type="text" placeholder={t('setting:PAC address')} value={this.state.pacAddr} onChange={this.handlePACAddrChange} />
                    </FormGroup>
                  </Col>
                </Container>
                :
                <Container>
                  <Col xs={12}>
                    <center>{t('setting:Will connect to server directly')}</center>
                  </Col>
                </Container>
        }
        <Divider text={t('setting:Times of reconnect')} />
        <Container>
          <Col xs={12}>
            <FormControl type="number" value={this.state.retries} onChange={this.handleSetRetries} />
          </Col>
          <Col xs={12}>
            <Alert variant='danger'>
              {t('setting:It may be unsafe!')}
            </Alert>
          </Col>
        </Container>
        <Divider onClick={this.handleShowAdvanced} text={
          <span>
            <span>{t('setting:Advanced (require restart)')}</span>
            <FontAwesome name={this.state.showAdvanced ? 'angle-up' : 'angle-down'} />
          </span>
        } />
        <Container>
          <Collapse in={this.state.showAdvanced}>
            <div>
              <Col xs={12}>
                <Form.Label>{t('setting:poi port')}</Form.Label>
                <FormControl type="number" value={this.state.port} onChange={this.handleSetPort} placeholder={t('setting:PoiDefaultPort')} />
              </Col>
              <Col xs={12}>
                <Form.Check type="checkbox" checked={this.state.allowLAN} onChange={this.handleSetAllowLAN}>{t('setting:Allow connections from LAN')}</Form.Check>
              </Col>
            </div>
          </Collapse>
        </Container>
        <Divider text={t('setting:Save settings')} />
        <Container>
          <Col xs={12}>
            <Button variant="success" onClick={this.handleSaveConfig} style={{width: '100%'}}>{t('setting:Save')}</Button>
          </Col>
        </Container>
      </form>
    )
  }
}
